import Crawler from './Crawler';
import fs from 'fs';
import path from 'path';
import crawlerConfig from '../../config/crawler.json';

class CrawlJob {
    private rootDirectory: string;

    /**
     * Main constructor.
     *
     * @param rootDirectory - The file path to save scraped webpage files to
     */
    public constructor(rootDirectory: string) {
        this.rootDirectory = rootDirectory;
    }

    /**
     * Starts the web crawling job.
     *
     * @remarks
     * Configuration options for the job can be specified in the files exclude.txt and visit.txt.
     *
     * @returns An void Promise
     */
    public async run(): Promise<void> {
        const linkConfig = require(crawlerConfig.linkLocation);
        const folderName = CrawlJob.generateFolderName();
        
        for (const university of linkConfig.universities) {
            const savePath = path.join(this.rootDirectory, folderName, university.name);
            const linksToVisit = university.include;
            const linksToIgnore = university.exclude.concat(linkConfig.globalExclude);

            const crawler: Crawler = new Crawler(savePath, linksToVisit, linksToIgnore);
            await crawler.scrapeAll();
            break;
        }
        
        Crawler.closeBrowser();
        return;
    }

    /**
     * Returns a string representing the folder name for a crawl job.
     *
     * @returns A folder name for a crawl job.
     */
    private static generateFolderName(): string {
        return 'crawl-job_' + CrawlJob.getCurrentDateAsString();
    }

    /**
     * Returns a string representation of the current date and time.
     *
     * @returns The current date and time as a string
     */
    private static getCurrentDateAsString(): string {
        const currentDate: Date = new Date();
        const formatOptions: Intl.DateTimeFormatOptions = { hour12: false };

        const dateString: string = currentDate.toLocaleString('en-SG', formatOptions).replace(new RegExp('[/:]', 'g'), '-').replace(/,/g, '_').replace(/\s+/g, '');

        return dateString;
    }

    /**
     * Setter for the class field rootDirectory.
     *
     * @param rootDirectory - The new root directory
     */
    public changeRootDirectory(rootDirectory: string): void {
        this.rootDirectory = rootDirectory;
    }
}

export default CrawlJob;
