// npm packages
import path from 'path';

// custom classes
import Crawler from './Crawler';
import JobDate from '../../utils/JobDate';
import CrawlLinkManager from '../databaseManagers/CrawlLinkManager';
import ExcludedLinkManager from '../databaseManagers/ExcludeLinkManager';
import { consoleLogger, appLogger } from '../../utils/logger';

// config files
import JobOptions from '../../../config/job.config.json';
import LinkOptions from '../../../config/link.config.json';

// typescript types
import UniversityOptions from '../../types/options/UniversityOptions';
import CrawlTracker from '../../types/CrawlTracker';

class CrawlJob {
    private rootDirectory: string;
    private databaseFilePath: string;

    private jobId: string;

    private trackers: Map<UniversityOptions, CrawlTracker>;

    /**
     * Main constructor.
     *
     * @param rootDirectory - The file path to save scraped webpage files to
     */
    public constructor(jobId: string) {
        this.jobId = jobId;

        this.rootDirectory = path.resolve(JobOptions.downloadRootDirectory);
        this.databaseFilePath = path.join(path.resolve(JobOptions.databaseLocation), this.jobId + '.db');

        // could be a singleton, but is never referenced again with current implementation
        const excludedLinkManager = new ExcludedLinkManager(this.databaseFilePath, 'excluded');

        // initialise trackers for each university category
        this.trackers = new Map<UniversityOptions, CrawlTracker>();
        for (const university of LinkOptions.universities) {
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
        const batchSize: number = JobOptions.batchSizePerCrawl;
        consoleLogger.info(`Crawling ${batchSize} sites`);
        appLogger.info(`Crawling ${batchSize} sites. ${Math.floor(batchSize / this.trackers.size)}`);
        await this.crawl(batchSize);
        return;
    }

    public async isComplete(): Promise<boolean> {
        for (const tracker of this.trackers.values()) {
            if (await tracker.include.hasUnvisitedUrls()) {
                return false;
            }
        }
        return true;
    }

    private async crawl(batchSize: number): Promise<void> {
        const batchSizePerCategory: number = Math.floor(batchSize / this.trackers.size);

        for (const [university, tracker] of this.trackers.entries()) {
            try {
                const savePath: string = path.join(this.rootDirectory, this.jobId, university.name);

                const linkPatterns: string[] = university.linkMustContain;
                const crawler: Crawler = new Crawler(savePath, linkPatterns, tracker, university.name);

                const urls: string[] = await tracker.include.getUnvisitedUrls(batchSizePerCategory);

                await crawler.scrapeAll(urls);
            } catch (err) {
                consoleLogger.error(`Crawl attempt failed for ${university.name}. Skipping...`);
                appLogger.error(`Crawl attempt failed for ${university.name}. ${err}`);
            }
        }
    }

    public async saveConfigsToDatabase(): Promise<void> {
        await this.saveUniversityConfigsToDatabase();
        await this.saveGlobalConfigsToDatabase();
    }

    private async saveUniversityConfigsToDatabase(): Promise<void> {
        for (const university of LinkOptions.universities) {
            try {
                const tracker: CrawlTracker = this.trackers.get(university)!;
                await this.updateExclusions(tracker.exclude, university.exclude, university.name);
                await this.updateInclusions(tracker.include, university.include);
            } catch (err) {
                appLogger.error(`Link configurations for ${university.name} failed to initialise. ${err}`);
                throw new Error(`Link configurations for ${university.name} failed to initialise.`);
            }
        }
        return;
    }

    private async saveGlobalConfigsToDatabase(): Promise<void> {
        try {
            const manager: ExcludedLinkManager = new ExcludedLinkManager(this.databaseFilePath, 'excluded');
            await this.updateExclusions(manager, LinkOptions.globalExclude, 'global');
        } catch (err) {
            appLogger.error(`Global link configurations failed to initialise. ${err}`);
            throw new Error(`Global link configurations failed to initialise.`);
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
    public static generateFolderName(): string {
        return ['crawlJob', CrawlJob.getCurrentDateAsString()].join('_');
    }

    /**
     * Returns a string representation of the current date and time.
     *
     * @returns The current date and time as a string
     */
    private static getCurrentDateAsString(): string {
        const dateString: string = JobDate.getCurrentDateString();

        return dateString.replace(new RegExp('[/:]', 'g'), '').replace(/,/g, '_').replace(/\s+/g, '');
    }
}

export default CrawlJob;
