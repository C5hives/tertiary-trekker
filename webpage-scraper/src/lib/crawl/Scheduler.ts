// npm packages
import { CronJob } from 'cron';
import path from 'path';

// custom classes
import CrawlJob from './CrawlJob';
import JobManager from '../databaseManagers/JobManager';
import { consoleLogger, appLogger } from '../../utils/logger';

// config files
import JobConfig from '../../../config/job.config.json';

// typescript types
import Job from '../../types/sql/Job';

class Scheduler {
    private static dbFilePath: string = path.join(path.resolve(JobConfig.databaseLocation), 'crawl_jobs.db');
    private static manager: JobManager = new JobManager(Scheduler.dbFilePath, 'jobs');

    public static async run(): Promise<void> {
        try {
            if (JobConfig.crawlPeriodically) {
                await this.runPeriodically();
            } else {
                await this.runContinuously();
            }
        } catch (err) {
            appLogger.error(`Job run failed. ${err}. Terminating program...`);
            consoleLogger.error('Job run failed. Terminating program...');
        }
    }

    private static async runContinuously(): Promise<void> {
        const { crawlJob, name } = await Scheduler.getCrawlJobAndName();

        let numberOfIterations: number = 0;

        appLogger.error(`Starting job ${name}. Mode: Concurrent`);
        consoleLogger.info(`Starting job ${name}. Mode: Concurrent`);

        while (!(await crawlJob.isComplete())) {
            try {
                numberOfIterations += 1;
                consoleLogger.info(`Iteration #${numberOfIterations} of ${name} started.`);
                await Scheduler.crawlOnce(crawlJob);
                consoleLogger.info(`Iteration #${numberOfIterations} of job ${name} concluded.`);
            } catch (err) {
                consoleLogger.error(err);
                appLogger.error(err);
            }
        }

        consoleLogger.info(`Crawl job ${name} is complete. Marking as complete.`);
        appLogger.info(`Crawl job ${name} is complete. Marking as complete.`);
        await Scheduler.manager.markJobAsComplete(name);
        consoleLogger.info(`Exiting program...`);
        process.exit(0);
    }

    private static async runPeriodically(): Promise<void> {
        const { crawlJob, name } = await Scheduler.getCrawlJobAndName();

        let numberOfIterations: number = 0;

        appLogger.info(`Starting job ${name}. Mode: Every ${JobConfig.crawlFrequencyInMinutes} minutes.`);
        consoleLogger.info(`Starting job ${name}. Mode: Every ${JobConfig.crawlFrequencyInMinutes} minutes.`);
        const cronJob = new CronJob(
            `*/${JobConfig.crawlFrequencyInMinutes} * * * *`, // cronTime,
            () => {
                numberOfIterations += 1;
                consoleLogger.info(`Iteration #${numberOfIterations} of ${name} started.`);
                Scheduler.crawlOnceUsingCron(crawlJob, name)
                    .then(() => {
                        consoleLogger.info(`Iteration #${numberOfIterations} of job ${name} concluded.`);
                    })
                    .catch((err) => {
                        consoleLogger.error(err);
                        appLogger.error(err);
                    });
            }, // onTick
            null, // onComplete
            false, // start
            'system' // timeZone
        );
        cronJob.start();
    }

    private static async crawlOnce(crawlJob: CrawlJob): Promise<void> {
        const start: number = performance.now();
        await crawlJob.run();
        const end: number = performance.now();
        const timeTaken: number = +(end - start).toFixed(2);

        consoleLogger.info(`Time Taken: ${timeTaken}ms`);
        return;
    }

    private static async crawlOnceUsingCron(crawlJob: CrawlJob, name: string): Promise<void> {
        if (await crawlJob.isComplete()) {
            consoleLogger.info(`Crawl job ${name} is complete. Marking as complete.`);
            appLogger.info(`Crawl job ${name} is complete. Marking as complete.`);
            process.exit(0);
        }
        const start: number = performance.now();
        await crawlJob.run();
        const end: number = performance.now();
        const timeTaken: number = +(end - start).toFixed(2);
        consoleLogger.info(`Time Taken: ${timeTaken}ms`);
        return;
    }

    private static async getCrawlJobAndName(): Promise<{ crawlJob: CrawlJob; name: string }> {
        const job: Job | null = await Scheduler.manager.getFirstIncompleteJob();

        if (job == null) {
            // no existing jobs, create a new one
            consoleLogger.info(`No existing jobs found. Creating a new one...`);
            const jobName: string = CrawlJob.generateFolderName();
            appLogger.info(`Creating new job ${jobName}`);
            await Scheduler.manager.addNewJob(jobName);

            const crawlJob: CrawlJob = new CrawlJob(jobName);
            await crawlJob.saveConfigsToDatabase();
            return { crawlJob: crawlJob, name: jobName };
        } else {
            // job already exists
            consoleLogger.info(`Incomplete job(s) found. Resuming crawl...`);
            appLogger.info(`Found job ${job.name} to resume.`);
            return { crawlJob: new CrawlJob(job.name), name: job.name };
        }
    }
}

export default Scheduler;
