// npm packages
import { CronJob } from "cron";
import path from "path";

// custom classes
import CrawlJob from "./CrawlJob";
import JobManager from "../databaseManagers/JobManager";
import JobDate from "../../utils/JobDate";

// config files
import JobConfig from "../../../config/job.config.json";

// typescript types
import Job from "../../types/sql/Job";

class Scheduler {
    private static dbFilePath: string = path.join(path.resolve(JobConfig.databaseLocation), 'crawl_jobs.db');
    private static manager: JobManager = new JobManager(Scheduler.dbFilePath, 'jobs');

    public static async run(): Promise<void> {
        const { crawlJob, name } = await Scheduler.getCrawlJobAndName();

        let numberOfIterations: number = 0;

        console.log(`[INFO] Scheduling job ${name} at ${JobDate.getCurrentDateString()}`);
        console.log(`[INFO] Attempts to crawl will be made every 5 minutes`);
        const cronJob = new CronJob(
            '*/5 * * * *', // cronTime,
            () => {
                numberOfIterations += 1;
                console.log(`[INFO] Iteration #${numberOfIterations} of ${name} at ${JobDate.getCurrentDateString()}`);
                Scheduler.crawlOnce(crawlJob, name)
                    .then(() => {
                        console.log(`[INFO] Iteration #${numberOfIterations} of job ${name} concluded at ${JobDate.getCurrentDateString()}`);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }, // onTick
            null, // onComplete
            false, // start
            'system' // timeZone
        );
        cronJob.start();
    }

    private static async crawlOnce(crawlJob: CrawlJob, jobName: string): Promise<void> {
        if (await crawlJob.isComplete()) {
            console.log(`[INFO] Crawl job ${jobName} is complete. Marking as complete...`);
            await Scheduler.manager.markJobAsComplete(jobName);
            process.exit(0);
        }
        await crawlJob.run();
        return;
    }

    private static async getCrawlJobAndName(): Promise<{ crawlJob: CrawlJob, name: string }> {
        const job: Job | null = await Scheduler.manager.getFirstIncompleteJob();

        if (job == null) {
            // no existing jobs, create a new one
            console.log(`[INFO] No existing jobs found. Creating a new one...`);
            const jobName: string = CrawlJob.generateFolderName();
            await Scheduler.manager.addNewJob(jobName);

            const crawlJob: CrawlJob = new CrawlJob(jobName);
            await crawlJob.saveConfigsToDatabase();
            return { crawlJob :crawlJob, name: jobName };
        } else {
            // job already exists
            console.log(`[INFO] Incomplete job(s) found. Resuming crawl...`);
            return { crawlJob: new CrawlJob(job.name), name: job.name };
        }
    }
}

export default Scheduler;