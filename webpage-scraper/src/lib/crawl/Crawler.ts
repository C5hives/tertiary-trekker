// npm packages
import { HTTPResponse, Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// custom classes
import JobDate from '../../utils/JobDate';
import WebpageDownloader from '../download/WebpageDownloader';
import { consoleLogger, appLogger } from '../../utils/logger';

// typescript types
import CrawlTracker from '../../types/CrawlTracker';
import HtmlParser from '../parse/HtmlParser';
import UrlFilter from '../parse/UrlFilter';

class Crawler {
    private static cluster: Cluster;

    private urlFilter: UrlFilter;
    private tracker: CrawlTracker;

    private discoveredUrls: Set<string>;
    private visitedUrls: Map<string, string>;

    private savePath: string;
    private universityName: string; // currently very hacky

    /**
     * Main constructor.
     */
    public constructor(savePath: string, urlPatterns: string[], tracker: CrawlTracker, universityName: string) {
        this.savePath = savePath;
        this.urlFilter = new UrlFilter();
        this.urlFilter.setUrlPatterns(urlPatterns);

        this.discoveredUrls = new Set<string>();
        this.visitedUrls = new Map<string, string>();

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
            appLogger.debug('No urls provided to crawl');
            return Promise.resolve();
        }

        try {
            this.discoveredUrls = new Set<string>();
            this.visitedUrls = new Map<string, string>();
            await this.initialiseBlacklistedUrls();
        } catch (err) {
            throw new Error(`Failed to initialize crawling trackers. ${err}`);
        }

        await this.initialiseCluster();
        this.queueUrls(urls);
        await this.waitForClusterToFinishCrawl();

        try {
            await this.markCrawledUrlsAsVisited();
            await this.addNewUrlsToCrawl();
        } catch (err) {
            throw new Error(`Failed to update crawl results into database. ${err}`);
        }
        return;
    }

    private async markCrawledUrlsAsVisited(): Promise<void> {
        const date: string = JobDate.getCurrentDateString();
        // convert map into an array of objects
        const urls: { url: string; outcome: string }[] = Array.from(this.visitedUrls, ([url, outcome]) => {
            return {
                url: url,
                outcome: outcome
            };
        });
        await this.tracker.include.markUrlsAsVisited(urls, date);
        return;
    }

    private async addNewUrlsToCrawl(): Promise<void> {
        const urls: string[] = Array.from(this.discoveredUrls.values());
        await this.tracker.include.insertUrlsToVisit(urls);
        return;
    }

    private async crawlUrl(jsObject: { page: Page; data: { url: string; crawler: Crawler } }): Promise<void> {
        const page = jsObject.page;
        let url = jsObject.data.url;
        const crawler = jsObject.data.crawler;

        appLogger.debug(`Starting crawl for ${url}.`);
        page.setDefaultNavigationTimeout(10000);

        try {
            const result = await crawler.getContentFromUrl(page, url);
            if (await crawler.tracker.include.isVisited(result.newUrl)) {
                appLogger.debug(`${result.newUrl} has already been visited. This is likely due to redirection. Skipping...`);
                appLogger.debug(`Marking ${url} as visited...`);
                crawler.visitedUrls.set(url, 'skipped'); // mark old url (that led to the redirection) as visited but skipped
                return;
            }

            if (!crawler.shouldCrawl(result.newUrl)) {
                appLogger.debug(`${result.newUrl} should not be crawled. Skipping...`);
                appLogger.debug(`Marking ${url} as visited...`);
                crawler.visitedUrls.set(url, 'skipped'); // mark old url (that led to the redirection) as visited but skipped
                return;
            }

            appLogger.debug(`${url} is new. Attempting to parse and save...`);
            url = result.newUrl; // update old url with new one

            const parser: HtmlParser = new HtmlParser(url, result.content);
            const content = parser.getCleanHtml();

            const newUrls: string[] = parser.getUniqueUrlsInHtml().filter(crawler.shouldCrawl, crawler);
            for (const url of newUrls) {
                crawler.discoveredUrls.add(url);
            }

            appLogger.info(`${crawler.discoveredUrls.size} new urls discovered.`);

            await WebpageDownloader.saveToFile(crawler.savePath, url, content);
            crawler.visitedUrls.set(url, 'ok');
        } catch (error) {
            appLogger.error(`Failed to complete crawl for ${url} ${error}`);
            consoleLogger.error(`Failed to complete crawl for ${url}`);
            crawler.visitedUrls.set(url, 'error - ' + error);
        }
        appLogger.debug(`Finished crawl for ${url}.`);
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

    private shouldCrawl(url: string): boolean {
        if (!this.urlFilter.containsUrlPattern(url)) {
            appLogger.debug(`${url} does not match url patterns`);
            return false;
        }

        if (this.urlFilter.isBlacklisted(url)) {
            appLogger.debug(`${url} is blacklisted`);
            return false;
        }

        if (!this.urlFilter.pointsToHtmlFile(url)) {
            // url is some kind of file extension that isn't .html
            appLogger.debug(`${url} is a path that points to a non-html file.`);
            return false;
        }

        return true;
    }

    private async initialiseCluster(): Promise<void> {
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
        return;
    }

    private async waitForClusterToFinishCrawl(): Promise<void> {
        await Crawler.cluster.idle();
        await Crawler.cluster.close();
        return;
    }

    private async initialiseBlacklistedUrls(): Promise<void> {
        const excludedUrls: string[] = await this.tracker.exclude.getBlacklistedUrls(this.universityName);
        this.urlFilter.setBlacklistedUrls(excludedUrls);
        return;
    }

    private queueUrls(urls: string[]): void {
        for (const url of urls) {
            Crawler.cluster.queue({
                url: url,
                crawler: this
            });
        }
        return;
    }
}

export default Crawler;
