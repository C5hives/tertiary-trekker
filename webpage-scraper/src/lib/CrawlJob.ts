import Crawler from './Crawler';
import path from 'path';
import jobConfig from '../../config/job-config.json';
import JobConfig from '../types/JobConfig';
import JobDate from '../utils/JobDate';
import LinkOptions from '../types/LinkOptions';
import UniversityConfig from '../types/UniversityConfig';
import CrawlLinkManager from './CrawlLinkManager';
import ExcludedLinkManager from './ExcludeLinkManager';
import CrawlTracker from '../types/CrawlTracker';

const linkOptions: LinkOptions = require(jobConfig.linkLocation);

class CrawlJob {
    private rootDirectory: string;
    private databaseFilePath: string;

    private jobId: string;

    private trackers: Map<UniversityConfig, CrawlTracker>;

    /**
     * Main constructor.
     *
     * @param rootDirectory - The file path to save scraped webpage files to
     */
    public constructor(jobId: string) {
        this.jobId = jobId;

        this.rootDirectory = path.resolve(jobConfig.downloadRootDirectory);
        this.databaseFilePath = path.join(path.resolve(jobConfig.databaseLocation), this.jobId);

        // could be a singleton, but is never referenced again with current implementation
        const excludedLinkManager = new ExcludedLinkManager(this.databaseFilePath, 'excluded');

        // initialise trackers for each university category
        this.trackers = new Map<UniversityConfig, CrawlTracker>();
        for (const university of linkOptions.universities) {
            const crawlLinkManager: CrawlLinkManager = new CrawlLinkManager(this.databaseFilePath, university.name);
            this.trackers.set(university, {
                include: crawlLinkManager,
                exclude: excludedLinkManager
            });
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
            const crawler: Crawler = new Crawler(savePath, linkPatterns, tracker, university.name);

            const urls: string[] = await tracker.include.getUnvisitedUrls(numberToCrawlPerCategory);
            
            await crawler.scrapeAll(urls);
        }
    }

    public async saveConfigsToDatabase(): Promise<void> {
        await this.saveUniversityConfigsToDatabase();
        await this.saveGlobalConfigsToDatabase();
        return;
    }

    private async saveUniversityConfigsToDatabase(): Promise<void> {
        for (const university of linkOptions.universities) {
            try {
                const tracker: CrawlTracker = this.trackers.get(university)!;
                await this.updateExclusions(tracker.exclude, university.exclude, university.name);
                await this.updateInclusions(tracker.include, university.include);
            } catch (err) {
                console.log(`Link configurations for ${university.name} failed to update due to ${err}`);
            }
        }
        return;
    }

    private async saveGlobalConfigsToDatabase(): Promise<void> {
        try {
            const manager: ExcludedLinkManager = new ExcludedLinkManager(this.databaseFilePath, "excluded");
            await this.updateExclusions(manager, linkOptions.globalExclude, 'global');
        } catch (err) {
            console.log(`Global link config failed to update due to ${err}`);
        }
        return;
    }

    private async updateExclusions(manager: ExcludedLinkManager, urls: string[], category: string): Promise<void> {
        if (urls.length < 1) {
            return;
        }

        await manager.insertExcludedLinks(urls, category);
        return;
    }

    private async updateInclusions(manager: CrawlLinkManager, urls: string[]): Promise<void> {
        if (urls.length < 1) {
            return;
        }

        await manager.insertUrlsToVisit(urls);
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
