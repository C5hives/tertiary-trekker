// npm packages
import sqlite3, { Database } from 'sqlite3';

// typescript types
import UrlToCrawl from '../../types/sql/UrlToCrawl';

class CrawlLinkManager {
    private db: Database;
    private tableName: string;

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

    public async markUrlsAsVisited(links: { url: string; outcome: string }[], date: string): Promise<number> {
        if (links.length < 1) {
            return Promise.resolve(0);
        }

        await this.ensureTableExists();

        let numberOfChanges: number = 0;
        for (const link of links) {
            numberOfChanges += await this.markUrlAsVisited(link, date);
        }
        return numberOfChanges;
    }

    private async markUrlAsVisited(link: { url: string; outcome: string }, date: string): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            const query: string = `UPDATE ${this.tableName} ` + `SET isVisited = ?, visitTime = ?, outcome = ? ` + 'WHERE url = ?';
            const values: string[] = ['TRUE', date, link.outcome, link.url];

            this.db.run(query, values, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                }
                resolve(this == null ? 0 : this.changes);
            });
        });
    }

    public async insertUrlsToVisit(urls: string[]): Promise<number> {
        if (urls.length < 1) {
            return Promise.resolve(0);
        }

        await this.ensureTableExists();

        let lastAffectedRow: number = 0;
        while (urls.length > 0) {
            // split the array into subarrays with length 50 to work around the sql insert limit of 100
            const numberOfValuesToInsertPerQuery = 50;
            const subArray: string[] = urls.splice(0, numberOfValuesToInsertPerQuery);

            lastAffectedRow = await new Promise<number>((resolve, reject) => {
                // generates multiple brackets containing placeholders depending on the number of values getting inserted
                const query: string = `INSERT INTO ${this.tableName} ` + '(url, isVisited) ' + 'VALUES ' + Array(subArray.length).fill('(?, ?)').join();
                const values: string[] = subArray.flatMap((url) => [url, 'FALSE']);

                this.db.run(query, values, function (err: Error | null) {
                    if (err !== null) {
                        reject(`${err}. Query: ${query}`);
                    }
                    resolve(this == null ? 0 : this.lastID);
                });
            });
        }

        return lastAffectedRow;
    }

    public async hasUnvisitedUrls(): Promise<boolean> {
        const unvisitedUrls = await this.getAllUnvisitedUrls();
        return unvisitedUrls.length > 0;
    }

    public async getUnvisitedUrls(limit: number): Promise<string[]> {
        if (limit < 1) {
            return Promise.reject('Invalid limit provided');
        }

        await this.ensureTableExists();

        const result: UrlToCrawl[] = await new Promise((resolve, reject) => {
            const query: string = 'SELECT * ' + `FROM ${this.tableName} ` + 'WHERE isVisited = ? ' + `LIMIT ${limit}`;
            const values: string[] = ['FALSE'];

            this.db.all(query, values, function (err: Error | null, rows: UrlToCrawl[]) {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });

        return result.map((urlToCrawl) => urlToCrawl.url);
    }

    private async getAllUnvisitedUrls(): Promise<string[]> {
        await this.ensureTableExists();

        const result: UrlToCrawl[] = await new Promise((resolve, reject) => {
            const query: string = 'SELECT * ' + `FROM ${this.tableName} ` + 'WHERE isVisited = ?';
            const values: string[] = ['FALSE'];

            this.db.all(query, values, function (err: Error | null, rows: UrlToCrawl[]) {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });

        return result.map((urlToCrawl) => urlToCrawl.url);
    }

    public async doesUrlExist(url: string): Promise<boolean> {
        await this.ensureTableExists();

        return new Promise((resolve, reject) => {
            const query: string = 'SELECT * ' + `FROM ${this.tableName} ` + 'WHERE url = ?';
            const values: string[] = [url];

            this.db.get(query, values, function (err: Error | null, row: UrlToCrawl) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                    return;
                }
                resolve(row != null);
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
                `(url VARCHAR(255),
                isVisited BOOLEAN,
                visitTime VARCHAR(255),
                outcome VARCHAR(10),
                UNIQUE (url) ON CONFLICT IGNORE)`;

            this.db.run(query, function (err: Error | null) {
                if (err !== null) {
                    reject(`${err}. Query: ${query}`);
                }
                resolve();
            });
        });
    }
}

export default CrawlLinkManager;
