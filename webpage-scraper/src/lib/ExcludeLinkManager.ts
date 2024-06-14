import UrlToExclude from '../types/UrlToExclude';
import sqlite3, { Database } from 'sqlite3';

class ExcludeLinkManager {
    private db: Database;
    private tableName: string;

    public constructor(dbFilePath: string, tableName: string) {
        this.db = new sqlite3.Database(dbFilePath + '.db', (err: Error | null) => {
            if (err !== null) {
                throw new Error(`Failed to initialise database object due to ${err}`);
            }
        });

        if (tableName.indexOf("'") >= 0) {
            tableName = tableName.replace(/'/g, "");
        }
        this.tableName = tableName;
    }

    public async getExcludedLinks(university: string): Promise<string[]> {
        await this.ensureTableExists();

        const result: UrlToExclude[] = await new Promise((resolve, reject) => {
            const query: string = "SELECT * " +
                `FROM ${this.tableName} ` +
                "WHERE category = ? OR category = 'global'";
            const values: string[] = [university];

            this.db.all(query, values,
                function (err: Error | null, rows: UrlToExclude[]) {
                    if (err !== null) {
                        reject(`${err}. Query: ${query}`);
                        return;
                    }
                    resolve(rows);
            });
        });

        return result.map(linkToExclude => linkToExclude.url);
    }

    public async insertExcludedLinks(urls: string[], category: string): Promise<number> {
        if (urls.length < 1) {
            return Promise.resolve(0);
        }

        await this.ensureTableExists();

        let lastAffectedRow: number = 0;
        while(urls.length > 0) {
            // split the array into subarrays with length 50 to work around the sql insert limit of 100
            const numberOfValuesToInsertPerQuery = 50;
            const subArray: string[] = urls.splice(0, numberOfValuesToInsertPerQuery);

            lastAffectedRow = await new Promise<number>((resolve, reject) => {
                // generates multiple brackets containing placeholders depending on the number of values getting inserted
                const query: string = `INSERT INTO ${this.tableName} ` +
                    "(url, category) " +
                    "VALUES " + Array(subArray.length).fill("(?, ?)").join();
                const values: string[] = subArray.flatMap(url => [url, category]);

                this.db.run(query, values,
                    function (err: Error | null) {
                        if (err !== null) {
                            reject(`${err}. Query: ${query}`);
                        }
                        resolve(this == null ? 0 : this.lastID);
                    }
                )
            });
        }

        return lastAffectedRow;
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
            const query: string = "SELECT name " +
                "FROM sqlite_master " +
                "WHERE type = 'table' AND name = ?";
            const values: string[] = [this.tableName];

            this.db.get(query, values,
                function (err: Error | null, row: any) {
                    if (err !== null) {
                        reject(`${err}. Query: ${query}`);
                        return;
                    }
                    resolve(row != null);
                }
            );
        });
    }

    private async createTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const query: string = `CREATE TABLE IF NOT EXISTS ${this.tableName} ` +
            `(
                url VARCHAR(255),
                category VARCHAR(255),
                UNIQUE (url, category) ON CONFLICT IGNORE
            )`;

            this.db.run(query,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(`${err}. Query: ${query}`);
                    }
                    resolve();
                }
            )
        });
    }
}

export default ExcludeLinkManager;