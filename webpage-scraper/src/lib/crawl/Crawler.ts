// npm packages
import * as cheerio from 'cheerio';
import { HTTPResponse, Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// custom classes
import JobDate from '../../utils/JobDate';
import UrlUtils from '../../utils/UrlUtils';
import WebpageDownloader from '../../utils/WebpageDownloader';
import { consoleLogger, appLogger } from '../../utils/logger';

// typescript types
import CrawlTracker from '../../types/CrawlTracker';

class Crawler {
    private static cluster: Cluster;

    private savePath: string;
    private linkPatterns: string[];

    private discoveredLinks: Set<string>;
    private visitedLinks: Map<string, string>;
    private excludedLinks: Set<string>;

    private tracker: CrawlTracker;

    // currently very hacky
    private universityName: string;

    /**
     * Main constructor.
     */
    public constructor(savePath: string, linkPatterns: string[], tracker: CrawlTracker, universityName: string) {
        this.savePath = savePath;
        this.linkPatterns = linkPatterns;

        this.discoveredLinks = new Set<string>();
        this.visitedLinks = new Map<string, string>();
        this.excludedLinks = new Set<string>();

        this.tracker = tracker;
        this.universityName = universityName;
    }

    /**
     * Scrapes the specified urls and saves their html content to local files.
     *
     * @param savePath - The root directory to save the files to
     * @param options - The urls to include and exclude when web crawling
     * @returns A void Promise
     */
    public async scrapeAll(urls: string[]): Promise<void> {
        if (urls.length < 1) {
            return Promise.resolve();
        }

        try {
            this.discoveredLinks = new Set<string>();
            this.visitedLinks = new Map<string, string>();

            const excludedUrls: string[] = await this.tracker.exclude.getExcludedLinks(this.universityName);
            this.excludedLinks = new Set<string>(excludedUrls);
        } catch (err) {
            throw new Error(`Failed to initialize crawling trackers. ${err}`);
        }

        Crawler.cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
            puppeteerOptions: { headless: true },
            retryLimit: 2,
            sameDomainDelay: 5000,
            skipDuplicateUrls: true,
            timeout: 30000,
            monitor: false,
            workerCreationDelay: 100,
            puppeteer: puppeteer.use(StealthPlugin())
        });

        // set function that each worker will run
        await Crawler.cluster.task(this.crawlUrl);

        for (const url of urls) {
            Crawler.cluster.queue({
                url: url,
                crawler: this
            });
        }

        await Crawler.cluster.idle();
        await Crawler.cluster.close();

        try {
            await this.markCrawledLinksAsVisited();
            await this.addNewLinks();
        } catch (err) {
            throw new Error(`Failed to update crawl results into database. ${err}`);
        }
        return;
    }

    private async markCrawledLinksAsVisited(): Promise<void> {
        const date: string = JobDate.getCurrentDateString();
        // convert map into an array of objects
        const links: { url: string; outcome: string }[] = Array.from(this.visitedLinks, ([url, outcome]) => {
            return {
                url: url,
                outcome: outcome
            };
        });
        await this.tracker.include.markUrlsAsVisited(links, date);
        return;
    }

    private async addNewLinks(): Promise<void> {
        const urls: string[] = Array.from(this.discoveredLinks.values());
        await this.tracker.include.insertUrlsToVisit(urls);
        return;
    }

    private async crawlUrl(jsObject: { page: Page; data: { url: string; crawler: Crawler } }): Promise<void> {
        const page = jsObject.page;
        let url = jsObject.data.url;
        const crawler = jsObject.data.crawler;

        appLogger.info(`Starting crawl for ${url}.`);
        page.setDefaultNavigationTimeout(10000);

        try {
            const result = await crawler.getContentFromUrl(page, url);
            const newUrl = result.newUrl;
            let content = result.content;
            
            url = newUrl; // will change only if the page redirects
            if (await crawler.tracker.include.isVisited(url)) {
                appLogger.info(`${url} has already been visited. This is likely due to redirection. Skipping...`);
                return;
            }

            if (!crawler.shouldCrawl(url)) {
                appLogger.info(`${url} is in the exclusion list. Skipping...`);
                crawler.visitedLinks.set(url, 'skipped');
                return;
            }

            content = crawler.removeUnneededTags(content);

            const newLinks: string[] = crawler.discoverUniqueLinks(content);
            const cleanUrls: string[] = crawler.buildAndCleanUrls(newLinks, url);

            for (const cleanUrl of cleanUrls) {
                if (crawler.shouldCrawl(cleanUrl)) {
                    crawler.discoveredLinks.add(cleanUrl);
                }
            }

            appLogger.info(`${crawler.discoveredLinks.size} new links discovered.`);

            await WebpageDownloader.saveToFile(crawler.savePath, url, content);
            crawler.visitedLinks.set(url, 'ok');
        } catch (error) {
            appLogger.error(`Failed to complete crawl. ${error}`);
            consoleLogger.error('Failed to complete crawl.');
            crawler.visitedLinks.set(url, 'error - ' + error);
        }
        return;
    }

    /**
     * Returns the html contents of a website as a string.
     *
     * @param page - A Page object used to visit website urls
     * @param url - The url to scrape data from
     * @returns A Promise containing the contents of the website
     */
    private async getContentFromUrl(page: Page, url: string): Promise<{ content: string; newUrl: string }> {
        // Navigate the page to a URL
        const response: HTTPResponse | null = await page.goto(url, { waitUntil: 'domcontentloaded' });

        if (response == null) {
            return Promise.reject(`No response. Failed to fetch content from ${url}`);
        }

        const content = await page.content();
        const newUrl = page.url();
        return { content, newUrl };
    }

    private removeUnneededTags(content: string): string {
        const $ = cheerio.load(content);
        $('script').remove(); // remove <script> tags
        $('noscript').remove(); // remove <noscript> tags
        $('link').remove(); // remove <link> tags
        $('style').remove(); // remove <style> tags

        return $.html();
    }

    /**
     * Returns a Set of urls embedded inside a html website.
     *
     * @param content - The string representation of a website
     * @returns A Set of urls
     */
    private discoverUniqueLinks(content: string): string[] {
        // a set is used here to prevent duplicates after parsing
        const uniqueUrls: Set<string> = new Set<string>();
        const $ = cheerio.load(content);
        // find <a> tags in the html and save their href attribute
        $('a').each(function () {
            const link: string | undefined = $(this).attr('href');
            if (link === undefined) {
                return;
            }
            uniqueUrls.add(link);
        });
        return Array.from(uniqueUrls.values());
    }

    /**
     * Transforms all urls into absolute urls.
     *
     * @param rawUrls - A Set of urls that may be absolute or relative urls
     * @param baseUrl - A base url to append relative urls to
     * @returns A Set of urls
     */
    private buildAndCleanUrls(rawUrls: string[], baseUrl: string): string[] {
        const cleanUrls: Set<string> = new Set<string>();
        for (const url of rawUrls) {
            try {
                // convert url into a standardised format
                if (url.includes('javascript')) {
                    appLogger.debug(`Skipping ${url} as it is a script.`);
                    continue;
                }
                const cleanUrl = UrlUtils.cleanUrl(url, baseUrl);
                cleanUrls.add(cleanUrl);
            } catch (err) {
                appLogger.error(`Failed to clean url. ${err}`);
            }
        }
        return Array.from(cleanUrls.values());
    }

    private shouldCrawl(url: string): boolean {
        if (!this.containsLinkPattern(url)) {
            appLogger.debug(`${url} does not match link patterns`);
            return false;
        }

        if (this.isBlacklisted(url)) {
            appLogger.debug(`${url} is blacklisted`);
            return false;
        }

        if (UrlUtils.isMimeType(url) && !UrlUtils.isHtml(url)) {
            // url is some kind of file extension that isn't .html
            appLogger.debug(`${url} is a path that points to a non-html file.`);
            return false;
        }

        return true;
    }

    private containsLinkPattern(url: string): boolean {
        for (const pattern of this.linkPatterns) {
            if (url.includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    private isBlacklisted(url: string): boolean {
        for (const excludedUrl of this.excludedLinks) {
            if (url.startsWith(excludedUrl)) {
                return true;
            }
        }
        return false;
    }
}

export default Crawler;
