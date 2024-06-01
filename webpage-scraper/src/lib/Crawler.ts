import cheerio = require('cheerio');
import Denque from 'denque';
import puppeteer, { Browser, Page } from 'puppeteer';
import UrlBuilder from '../utils/UrlBuilder';
import WebpageDownloader from './WebpageDownloader';
import LinkOptions from '../types/LinkOptions';

class Crawler {
    private browser!: Browser;
    private linksToVisit: Denque<string>;
    private linksToIgnore: Set<string>;
    private visitedLinks: Set<string>;

    /**
     * Main constructor.
     */
    public constructor() {
        this.linksToVisit = new Denque<string>();
        this.linksToIgnore = new Set<string>();
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
    public async init(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true
        });
    }

    /**
     * Scrapes the specified urls and saves their html content to local files.
     *
     * @param savePath - The root directory to save the files to
     * @param options - The urls to include and exclude when web crawling
     * @returns A void Promise
     */
    public async scrapeAll(savePath: string, options: LinkOptions): Promise<void> {
        // initialize browser object if not already done so
        if (!this.browser) {
            await this.init();
        }

        // cleans up tracked visited links
        this.resetCrawlingTrackers();
        this.populateStartLinks(options.start);
        this.populateExcludeLinks(options.ignore);

        let counter = 0;

        while (!this.linksToVisit.isEmpty()) {
            // assert that calling shift() on the Denque will not produce undefined
            const url = this.linksToVisit.shift()!;

            // check if link has already been visited
            // if so, skip
            if (this.visitedLinks.has(url)) {
                console.log(`Skipping duplicate link ${url}`);
                continue;
            }

            if (this.isExcluded(url)) {
                console.log(`Ignoring link ${url}`);
                continue;
            }

            const page: Page = await this.browser.newPage();

            console.log(`Starting to scrape ${url}`);
            await this.scrapeWebsite(url, page, savePath);
            console.log(`Scrape complete for ${url}`);

            // close page after scraping is done
            page.close();

            counter += 1;
        }

        console.log(`${counter} links crawled`);

        // clean up before returning
        await this.browser.close();

        return;
    }

    /**
     * Scrapes one specified url and saves its content to a local file.
     *
     * @remarks
     * This method will also scrape content within the original url and save their contents as well.
     *
     * @param url - The url to scrape data from
     * @param page - A Page object used to visit website urls
     * @param savePath - The file path to save scraped content to
     */
    private async scrapeWebsite(url: string, page: Page, savePath: string): Promise<void> {
        try {
            const content: string = await this.getContentFromUrl(page, url);

            const newLinks: Set<string> = this.discoverLinksInWebpage(content);
            const cleanedUrls: Set<string> = this.buildAndCleanUrls(newLinks, url);
            this.addLinksToBeVisited(cleanedUrls);

            await WebpageDownloader.saveToFile(savePath, url, content);
        } catch (error) {
            console.error(error);
        } finally {
            this.visitedLinks.add(url);
        }
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
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

        if (response == null) {
            // TODO: maybe add something to keep track of failed crawl attempts to retry later/log
            throw new Error(`Failed to fetch content from ${url}`);
        }

        if (response.status() >= 300 && response.status() <= 399) {
            console.log('Redirect from', response.url(), 'to', response.headers()['location']);
        }

        if (!response.ok()) {
            throw new Error(`Failed to fetch content from ${url}`);
        }

        return await page.content();
    }

    /**
     * Returns a Set of urls embedded inside a html website.
     *
     * @param content - The string representation of a website
     * @returns A Set of urls
     */
    private discoverLinksInWebpage(content: string): Set<string> {
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
        return uniqueUrls;
    }

    /**
     * Transforms all urls into absolute urls.
     *
     * @param rawUrls - A Set of urls that may be absolute or relative urls
     * @param baseUrl - A base url to append relative urls to
     * @returns A Set of urls
     */
    private buildAndCleanUrls(rawUrls: Set<string>, baseUrl: string): Set<string> {
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
        return cleanedUrls;
    }

    /**
     * Updates the links that should be visited when web crawling.
     *
     * @param urls - An array of urls
     */
    private populateStartLinks(urls: string[]): void {
        for (const url of urls) {
            this.linksToVisit.push(url);
        }
        return;
    }

    /**
     * Updates the links that should be ignored when web crawling.
     *
     * @param urls - An array of urls
     */
    private populateExcludeLinks(urls: string[]): void {
        for (const url of urls) {
            this.linksToIgnore.add(url);
        }
        return;
    }

    /**
     * Updates discovered links that should be visited when web crawling.
     *
     * @param links - A set of urls
     */
    private addLinksToBeVisited(links: Set<string>): void {
        // add discovered links to Denque
        for (const link of links) {
            this.linksToVisit.push(link);
        }
        return;
    }

    /**
     * Resets the objects that are used internally for tracking web crawling progress.
     */
    private resetCrawlingTrackers(): void {
        this.linksToVisit = new Denque<string>();
        this.visitedLinks = new Set<string>();
        return;
    }

    /**
     * Returns a boolean indicating whether the specified url should be crawled.
     *
     * @param url - An absolute url
     * @returns A boolean
     */
    private isExcluded(url: string): boolean {
        for (const link of this.linksToIgnore) {
            if (url.startsWith(link)) {
                return true;
            }
        }
        return false;
    }
}

export default Crawler;
