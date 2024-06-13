import Crawler from './Crawler';
import path from 'path';
import jobConfig from '../../config/job-config.json';
import JobConfig from '../types/JobConfig';
import JobDate from '../utils/JobDate';
import LinkTracker from './LinkTracker';
import LinkOptions from '../types/LinkOptions';
import UniversityConfig from '../types/UniversityConfig';

class CrawlJob {
    private jobConfig: JobConfig = jobConfig;
    private linkOptions: LinkOptions;

    private rootDirectory: string;
    private databaseFilePath: string;

    private jobId: string;

    private trackers: Map<UniversityConfig, LinkTracker>;

    /**
     * Main constructor.
     *
     * @param rootDirectory - The file path to save scraped webpage files to
     */
    public constructor(jobId: string = CrawlJob.generateFolderName()) {
        this.linkOptions = require(this.jobConfig.linkLocation);

        this.rootDirectory = path.resolve(this.jobConfig.downloadRootDirectory);
        this.databaseFilePath = path.resolve(this.jobConfig.databaseLocation);

        this.jobId = jobId;

        // initialise trackers for each university category
        this.trackers = new Map<UniversityConfig, LinkTracker>();
        for (const university of this.linkOptions.universities) {
            this.trackers.set(university, new LinkTracker(this.databaseFilePath, this.jobId, university.name));
        }
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
        await this.saveConfigsToDatabase();
        await this.crawl(1000);
        return;
    }

    public async crawl(numberToCrawlPerCategory: number): Promise<void> {
        for (const [university, tracker] of this.trackers.entries()) {
            const savePath: string = path.join(this.rootDirectory, this.jobId, university.name);
            const linkPatterns: string[] = university.linkMustContain;
            const crawler: Crawler = new Crawler(savePath, linkPatterns, tracker);

            const urls: string[] = await tracker.getUnvisitedUrls(numberToCrawlPerCategory);
            
            await crawler.scrapeAll(urls);
        }
    }

    public async saveConfigsToDatabase(): Promise<void> {
        await this.saveUniversityConfigsToDatabase();
        await this.saveGlobalConfigsToDatabase();
        return;
    }

    private async saveUniversityConfigsToDatabase(): Promise<void> {
        for (const university of this.linkOptions.universities) {
            try {
                const tracker: LinkTracker = this.trackers.get(university)!;
                await this.updateExclusions(tracker, university.exclude);
                await this.updateInclusions(tracker, university.include);
            } catch (err) {
                console.log(`${university.name} link config failed to update due to ${err}`);
            }
        }
        return;
    }

    private async saveGlobalConfigsToDatabase(): Promise<void> {
        try {
            const tracker: LinkTracker = new LinkTracker(this.databaseFilePath, this.jobId, "global");
            await this.updateExclusions(tracker, this.linkOptions.globalExclude);
        } catch (err) {
            console.log(`Global link config failed to update due to ${err}`);
        }
        return;
    }

    private async updateExclusions(tracker: LinkTracker, urls: string[]): Promise<void> {
        if (urls.length < 1) {
            return;
        }

        await tracker.insertNewUrlsToExclude(urls);
        return;
    }

    private async updateInclusions(tracker: LinkTracker, urls: string[]): Promise<void> {
        if (urls.length < 1) {
            return;
        }

        await tracker.insertNewUrlsToVisit(urls);
        return;
    }

    /**
     * Returns a string representing the folder name for a crawl job.
     *
     * @returns A folder name for a crawl job.
     */
    private static generateFolderName(): string {
        return ['crawlJob', CrawlJob.getCurrentDateAsString()].join("_");
    }

    /**
     * Returns a string representation of the current date and time.
     *
     * @returns The current date and time as a string
     */
    private static getCurrentDateAsString(): string {
        const dateString: string = JobDate.getCurrentDateString();
        
        return dateString
            .replace(new RegExp('[/:]', 'g'), '')
            .replace(/,/g, '_')
            .replace(/\s+/g, '');
    }
}

export default CrawlJob;
