// npm packages
import sqlite3, { Database } from 'sqlite3';

// custom classes
import JobDate from '../../utils/JobDate';

// typescript types
import Job from '../../types/sql/Job';

class JobManager {
    private db: Database;
    private tableName: string = 'jobs';

    public constructor(dbFilePath: string, tableName: string) {
        this.db = new sqlite3.Database(dbFilePath, (err: Error | null) => {
            if (err !== null) {
                throw new Error(`Failed to initialise database object due to ${err}`);
            }
        });

        if (tableName.indexOf("'") >= 0) {
            tableName = tableName.replace(/'/g, '');
        }
        this.tableName = tableName;
    }

    public async getFirstIncompleteJob(): Promise<Job | null> {
        await this.ensureTableExists();

        const jobs: Job[] = await this.getIncompleteJobs();
        console.log(`[INFO] Found ${jobs.length} incomplete jobs`);

        return jobs?.[0];
    }

    public async addNewJob(jobName: string): Promise<number> {
        await this.ensureTableExists();

        const jobNameExists: boolean = await this.doesJobNameExist(jobName);
        if (jobNameExists) {
            return Promise.reject('Job name already exists');
        }

        const date: string = JobDate.getCurrentDateString();

        return new Promise((resolve, reject) => {
            const query: string = `INSERT INTO ${this.tableName} ` + '(name, isComplete, startTime) ' + 'VALUES (?, ?, ?)';
            const values: string[] = [jobName, 'FALSE', date];

            this.db.run(query, values, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(this == null ? 0 : this.changes);
            });
        });
    }

    public async markJobAsComplete(jobName: string): Promise<number> {
        await this.ensureTableExists();

        const date: string = JobDate.getCurrentDateString();
        return new Promise((resolve, reject) => {
            const query: string = `UPDATE ${this.tableName} ` + 'SET isComplete = ?, endTime = ? ' + 'WHERE name = ?';
            const values: string[] = ['TRUE', date, jobName];

            this.db.run(query, values, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(this == null ? 0 : this.changes);
            });
        });
    }

    public async markJobsAsComplete(jobNames: string[]): Promise<number> {
        await this.ensureTableExists();

        const date: string = JobDate.getCurrentDateString();
        return new Promise((resolve, reject) => {
            const query: string = `UPDATE ${this.tableName} ` + 'SET isComplete = ?, endTime = ? ' + 'WHERE ' + Array(jobNames.length).fill('name = ?').join(' OR ');
            const values: string[] = ['TRUE', date].concat(jobNames);

            this.db.run(query, values, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(this == null ? 0 : this.changes);
            });
        });
    }

    private async doesJobNameExist(jobName: string): Promise<boolean> {
        await this.ensureTableExists();

        const jobs: Job[] = await new Promise((resolve, reject) => {
            const query: string = 'SELECT * ' + `FROM ${this.tableName} ` + 'WHERE name = ?';
            const values: string[] = [jobName];

            this.db.all(query, values, function (err: Error | null, rows: Job[]) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(rows);
            });
        });
        return jobs.length > 0;
    }

    private async getIncompleteJobs(): Promise<Job[]> {
        await this.ensureTableExists();

        return new Promise((resolve, reject) => {
            const query: string = 'SELECT * ' + `FROM ${this.tableName} ` + 'WHERE isComplete = ?';
            const values: string[] = ['FALSE'];

            this.db.all(query, values, function (err: Error | null, rows: Job[]) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(rows);
            });
        });
    }

    private async ensureTableExists(): Promise<boolean> {
        const tableExists: boolean = await this.doesTableExist();
        if (!tableExists) {
            await this.createTable();
            return false;
        }
        return true;
    }

    private async doesTableExist(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query: string = 'SELECT name ' + 'FROM sqlite_master ' + 'WHERE type = ? AND name = ?';
            const values: string[] = ['table', this.tableName];

            this.db.get(query, values, function (err: Error | null, row) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(row != null);
            });
        });
    }

    private async createTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const query: string =
                `CREATE TABLE IF NOT EXISTS ${this.tableName} ` +
                `(name VARCHAR(255),
                isComplete BOOLEAN,
                startTime VARCHAR(255),
                endTime VARCHAR(255),
                UNIQUE (name) ON CONFLICT IGNORE)`;

            this.db.run(query, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                }
                resolve();
            });
        });
    }
}

export default JobManager;
