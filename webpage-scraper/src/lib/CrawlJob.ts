import Crawler from './Crawler';
import fs from 'fs';
import path from 'path';

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
        const savePath = path.join(this.rootDirectory, CrawlJob.generateFolderName());
        const crawler: Crawler = new Crawler();

        // read links from some external file

        // const links: string[] = [
        //     Universities.NUS,
        //     Universities.NTU,
        //     Universities.SIT,
        //     Universities.SMU,
        //     Universities.SUSS,
        //     Universities.SUTD
        // ];

        const startingLinks = this.parseStartingLinks();
        const excludeLinks = this.parseLinksToExclude();

        await crawler.scrapeAll(savePath, {
            start: startingLinks,
            ignore: excludeLinks
        });
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
     * Reads from ./config/exclude.txt and returns an array of urls.
     *
     * @remarks
     * These urls will not be crawled by the web crawler.
     *
     * @returns An array of urls
     */
    private parseLinksToExclude(): string[] {
        return fs.readFileSync('./config/exclude.txt').toString('utf8').split('\r\n');
    }

    /**
     * Reads from ./config/visit.txt and returns an array of urls.
     *
     * @remarks
     * These urls will be crawled by the web crawler.
     *
     * @returns An array of urls
     */
    private parseStartingLinks(): string[] {
        return fs.readFileSync('./config/visit.txt').toString('utf8').split('\r\n');
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
