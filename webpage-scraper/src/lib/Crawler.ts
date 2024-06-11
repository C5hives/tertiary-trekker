import cheerio = require('cheerio');
import Denque from 'denque';
import { Browser, HTTPResponse, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra';
import UrlBuilder from '../utils/UrlBuilder';
import WebpageDownloader from './WebpageDownloader';

class Crawler {
    private static browser: Browser;
    
    private startLinks: string [] = new Array();
    private linkPattern: string = '';
    private savePath: string = '';

    // trackers for crawling
    private linksToVisit: Denque<string>;
    private visitedLinks: Set<string>;

    /**
     * Main constructor.
     */
    public constructor(savePath: string, startLinks: string[], linkPattern: string) {
        this.startLinks = startLinks;
        this.linkPattern = linkPattern;

        this.savePath = savePath;

        this.linksToVisit = new Denque<string>();
        this.visitedLinks = new Set<string>();
    }

    /**
     * Initializes the browser used to visit webpages.
     *
     * @remarks
     * This operation is not included in the constructor because of its async nature.
     *
     * @returns A void Promise
     */
    public static async initBrowser(): Promise<void> {
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        Crawler.browser = await puppeteer.launch({
            headless: true
        });
    }

    public static async closeBrowser(): Promise<void> {
        await Crawler.browser.close();
    }

    /**
     * Scrapes the specified urls and saves their html content to local files.
     *
     * @param savePath - The root directory to save the files to
     * @param options - The urls to include and exclude when web crawling
     * @returns A void Promise
     */
    public async scrapeAll(): Promise<void> {
        if (this.startLinks.length < 1) {
            console.log('[WARN] No starting links provided. Ending scraping attempt.');
        }

        // initialize browser object if not already done so
        if (!Crawler.browser) {
            await Crawler.initBrowser();
        }

        // reset web crawling trackers
        this.visitedLinks = new Set<string>();
        this.linksToVisit = new Denque<string>();

        // add links for crawler to start with
        for (const link of this.startLinks) {
            this.linksToVisit.push(link);
        }

        let numberOfWebsitesCrawled = 0;

        while (!this.linksToVisit.isEmpty()) {
            // calling Denque::shift() will not produce undefined
            const url = this.linksToVisit.shift()!;

            // check if link has already been visited
            // if so, skip
            if (this.visitedLinks.has(url)) {
                console.log(`[INFO] Skipping duplicate link ${url}`);
                continue;
            }

            // ignores urls that do not have linkPattern as a substring
            // this prevents the crawler from navigating out of the domain
            if (url.indexOf(this.linkPattern) < 0) {
                console.log(`[INFO] Ignoring link ${url}`);
                continue;
            }

            console.log(`[INFO] Crawling ${url}`);
            try {
                const page: Page = await Crawler.browser.newPage();
                const content: string = await this.getContentFromUrl(page, url);

                const newLinks: string[] = this.discoverUniqueLinks(content);
                const cleanUrls: string[] = this.buildAndCleanUrls(newLinks, url);

                for (const cleanUrl of cleanUrls) {
                    this.linksToVisit.push(cleanUrl);
                }
                
                await WebpageDownloader.saveToFile(this.savePath, url, content);
                // console.log(`[INFO] Scrape complete for ${url}`);
                await page.close();
            } catch (error) {
                console.error(`[ERROR] ${error}`);
            } finally {
                this.visitedLinks.add(url);
                numberOfWebsitesCrawled += 1;
            }
        }

        console.log(`[INFO] ${numberOfWebsitesCrawled} links crawled`);

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
        const response: HTTPResponse | null = await page.goto(url, { waitUntil: 'domcontentloaded' });

        if (response == null) {
            // TODO: maybe add something to keep track of failed crawl attempts to retry later/log
            throw new Error(`[ERROR] Failed to fetch content from ${url}`);
        }

        if (response.status() >= 300 && response.status() <= 399) {
            console.log('[INFO] Redirect from', response.url(), 'to', response.headers()['location']);
        }

        // console.log(`[INFO] Response status: ${response.status()}`);

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

    /**
     * Updates the links that should be visited when web crawling.
     *
     * @param urls - An array of urls
     */
    // private populateStartLinks(urls: string[]): void {
    //     for (const url of urls) {
    //         this.linksToVisit.push(url);
    //     }
    //     return;
    // }

    /**
     * Updates the links that should be ignored when web crawling.
     *
     * @param urls - An array of urls
     */
    // private populateExcludeLinks(urls: string[]): void {
    //     for (const url of urls) {
    //         this.linksToIgnore.add(url);
    //     }
    //     return;
    // }

    /**
     * Updates discovered links that should be visited when web crawling.
     *
     * @param links - A set of urls
     */
    // private addLinksToBeVisited(links: Set<string>): void {
    //     // add discovered links to Denque
    //     for (const link of links) {
    //         this.linksToVisit.push(link);
    //     }
    //     return;
    // }

    /**
     * Resets the objects that are used internally for tracking web crawling progress.
     */
    // private resetCrawlingTrackers(): void {
    //     this.linksToVisit = new Denque<string>();
    //     this.visitedLinks = new Set<string>();
    //     return;
    // }

    /**
     * Returns a boolean indicating whether the specified url should be crawled.
     *
     * @param url - An absolute url
     * @returns A boolean
     */
    private isExcluded(url: string, linksToIgnore: Set<string>): boolean {
        if (url.includes("nus.edu.sg")) {
            return false;
        } else {
            return true;
        }
        
        for (const link of linksToIgnore) {
            if (url.startsWith(link)) {
                return true;
            }
        }
        return false;
    }
}

export default Crawler;
