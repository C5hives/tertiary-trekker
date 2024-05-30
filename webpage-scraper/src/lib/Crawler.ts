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

    public constructor() {
        this.linksToVisit = new Denque<string>();
        this.linksToIgnore = new Set<string>();
        this.visitedLinks = new Set<string>();
    }

    public async init(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true
        });
    }

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

    private async getContentFromUrl(page: Page, url: string): Promise<string> {
        // Navigate the page to a URL
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

        if (response == null) {
            // TODO: maybe add something to keep track of failed crawl attempts to retry later/log
            throw new Error(`Failed to fetch content from ${url}`);
        }

        if (response.status() >= 300 && response.status() <= 399) {
            console.log('Redirect from', response.url(), 'to', response.headers()['location'])
        }

        if (!response.ok()) {
            throw new Error(`Failed to fetch content from ${url}`);
        }
        
        return await page.content();
    }

    private discoverLinksInWebpage(content: string): Set<string> {
        // a set is used here to prevent duplicates after parsing
        const uniqueUrls: Set<string> = new Set<string>();
        const $ = cheerio.load(content);
        // find <a> tags in the html and save their href attribute
        $("a").each(function () {
            const link: string | undefined = $(this).attr("href");
            if (link === undefined) {
                return;
            }
            uniqueUrls.add(link);
        });
        return uniqueUrls;
    }

    private buildAndCleanUrls(rawUrls: Set<string>, baseUrl: string): Set<string> {
        const cleanedUrls: Set<string> = new Set<string>;
        for (const url of rawUrls) {
            // parsed url in html may be a relative link, need to get full url if so
            const fullUrl = UrlBuilder.buildFullUrl(url, baseUrl);
            // remove additional parameters at the end of the url
            const cleanedUrl = UrlBuilder.cleanUrl(fullUrl);

            if (cleanedUrl === "") {
                continue;
            }
            cleanedUrls.add(cleanedUrl);
        }
        return cleanedUrls;
    }

    private populateStartLinks(urls: string[]): void {
        for (const url of urls) {
            this.linksToVisit.push(url);
        }
    }

    private populateExcludeLinks(urls: string[]): void {
        for (const url of urls) {
            this.linksToIgnore.add(url);
        }
    }

    private addLinksToBeVisited(links: Set<string>): void {
        // add discovered links to Denque
        for (const link of links) {
            this.linksToVisit.push(link);
        }
        return;
    }
    
    private resetCrawlingTrackers() {
        // remove all previous links
        this.linksToVisit = new Denque<string>();
        this.visitedLinks = new Set<string>();
    }

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