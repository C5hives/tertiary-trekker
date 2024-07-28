import cheerio = require('cheerio');
import { HTTPResponse, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra';
import UrlBuilder from '../utils/UrlBuilder';
import WebpageDownloader from './WebpageDownloader';
import { Cluster } from 'puppeteer-cluster';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import CrawlTracker from '../types/CrawlTracker';
import JobDate from '../utils/JobDate';

class Crawler {
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
            throw new Error(`Failed to initialize data structures for updating crawling status : ${err}`);
        }
        
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
            puppeteerOptions: { headless: true},
            retryLimit: 2,
            sameDomainDelay: 1000,
            skipDuplicateUrls: true,
            timeout: 30000,
            monitor: false,
            workerCreationDelay: 100,
            puppeteer: puppeteer.use(StealthPlugin())
        });
    
        // set function that each worker will run
        await cluster.task(this.crawlUrl); 
        
        for (const url of urls) {
            cluster.queue({
                url: url,
                crawler: this
            });
        }
        
        await cluster.idle();
        await cluster.close();

        try {
            await this.markCrawledLinksAsVisited();
            await this.addNewLinks();
        } catch (err) {
            console.log(`Failed to update crawl results into database due to: ${err}`);
        }
        return;
    }

    private async markCrawledLinksAsVisited(): Promise<void> {
        const date: string = JobDate.getCurrentDateString();
        // convert map into an array of objects
        const links: { url: string, outcome: string }[] = Array.from(this.visitedLinks, ([url, outcome]) => {
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

    private async crawlUrl(jsObject: { page: Page, data: { url: string, crawler: Crawler }}): Promise<void> {
        const page = jsObject.page;
        const url = jsObject.data.url;
        const crawler = jsObject.data.crawler;

        page.setDefaultNavigationTimeout(10000);

        try {
            const content: string = await crawler.getContentFromUrl(page, url);

            const newLinks: string[] = crawler.discoverUniqueLinks(content);
            const cleanUrls: string[] = crawler.buildAndCleanUrls(newLinks, url);

            for (const cleanUrl of cleanUrls) {
                if (crawler.shouldCrawl(cleanUrl)) {
                    crawler.discoveredLinks.add(cleanUrl);
                }
            }
            
            await WebpageDownloader.saveToFile(crawler.savePath, url, content);
            crawler.visitedLinks.set(url, "ok");
        } catch (error) {
            console.error(`[ERROR] Failed to complete crawl for ${this.universityName} due to: ${error}`);
            crawler.visitedLinks.set(url, "error");
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
    private async getContentFromUrl(page: Page, url: string): Promise<string> {
        // Navigate the page to a URL
        let response: HTTPResponse | null = await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        if (response == null) {
            return Promise.reject(`[ERROR] No response. Failed to fetch content from ${url}`);
        }
        return await page.content();
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
        const cleanedUrls: Set<string> = new Set<string>();
        for (const url of rawUrls) {
            // parsed url in html may be a relative link, need to get full url if so
            const fullUrl = UrlBuilder.buildFullUrl(url, baseUrl);
            // remove additional parameters at the end of the url
            const cleanedUrl = UrlBuilder.cleanUrl(fullUrl);
            if (cleanedUrl === '') {
                continue;
            }
            cleanedUrls.add(cleanedUrl);
        }
        return Array.from(cleanedUrls.values());
    }

    private shouldCrawl(url: string): boolean {
        if (!this.containsLinkPattern(url)) {
            return false;
        }

        if (this.isBlacklisted(url)) {
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
