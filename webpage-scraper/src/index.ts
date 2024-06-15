import JobManager from './lib/databaseManagers/JobManager';
import jobConfig from '../config/job.config.json';
import path from 'path';
import Job from './types/sql/Job';

async function run() {
    try {
        const dbFilePath: string = path.join(path.resolve(jobConfig.databaseLocation), 'crawl_jobs.db');
        const manager: JobManager = new JobManager(dbFilePath, 'jobs');
        await manager.addNewJob('test2');
        await manager.addNewJob('test3');

        const job: Job | null = await manager.getFirstIncompleteJob();
        console.log(job);

        // await manager.markJobAsComplete("test");
        // const job_none: Job | null = await manager.getFirstIncompleteJob();
        // console.log(job_none);
    } catch (err) {
        console.log(err);
    }
}

run();
