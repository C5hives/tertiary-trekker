import DatabaseController from '../utils/DatabaseController';
import Job from '../types/Job';
import JobDate from '../utils/JobDate';

class JobManager {
    private controller: DatabaseController;
    private tableName: string = 'jobs';

    public constructor(databaseFilePath: string) {
        this.controller = new DatabaseController(databaseFilePath, 'past_jobs');
    }

    public async getFirstIncompleteJob(): Promise<Job | null> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            return null;
        }

        const jobs: Job[] = await this.getIncompleteJobs();

        if (jobs.length < 1) {
            return null;
        } else {
            return jobs[0];
        }
    }

    public async addNewJob(jobName: string): Promise<void> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            this.createTable();
        }

        const jobNameExists: boolean = await this.doesJobNameExist(jobName);
        if (jobNameExists) {
            return Promise.reject("Job name already exists");
        }

        const date: string = JobDate.getCurrentDateString();

        this.controller.insertValues(this.tableName,
            "name, isComplete, startTime",
            [`'${jobName}', 'FALSE', '${date}'`]
        ).catch((err) => {
            console.log(err);
        });

        return;
    }

    public async markJobAsComplete(jobName: string): Promise<number> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            this.createTable();
        }

        const date: string = JobDate.getCurrentDateString();
        const numberOfAffectedRows = await this.controller.updateValues(this.tableName,
            `isComplete = 'TRUE', endTime = '${date}'`,
            `name='${jobName}'`);

        return numberOfAffectedRows;
    }

    public async markJobsAsComplete(jobNames: string[]): Promise<number> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            this.createTable();
        }

        const conditions: string = jobNames.map(name => "name='"+ name +"'").join(" OR ")

        const date: string = JobDate.getCurrentDateString();
        const numberOfAffectedRows = await this.controller.updateValues(this.tableName,
            `isComplete = 'TRUE', endTime = '${date}'`,
            conditions);

        return numberOfAffectedRows;
    }

    private createTable(): void {
        this.controller.createTable(this.tableName,
            `name VARCHAR(255),
            isComplete BOOLEAN,
            startTime VARCHAR(255),
            endTime VARCHAR(255),
            UNIQUE (name)`
        ).catch((err) => {
            console.log(err);
        });
        return;
    }

    private async doesJobNameExist(jobName: string): Promise<boolean> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            this.createTable();
            return false;
        }

        const jobs: Job[] = await this.controller.selectValues(this.tableName, `name = '${jobName}'`);
        return jobs.length > 0;
    }

    private async getIncompleteJobs(): Promise<Job[]> {
        return await this.controller.selectValues(this.tableName, "isComplete = 'FALSE'");
    }
}

export default JobManager;