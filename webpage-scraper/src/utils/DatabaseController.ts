import sqlite3, { Database } from 'sqlite3';
import path, { resolve } from 'path';

class DatabaseController {
    private dbFileName: string;
    private db: Database;
    private initialised: boolean = false;

    public constructor(dbFolderPath: string, dbFileName: string) {
        this.dbFileName = dbFileName;
        const dbFilePath: string = path.join(dbFolderPath, this.dbFileName + '.db');

        // initialises the db object to reference the specified .db file
        this.db = new sqlite3.Database(dbFilePath, (err: Error | null) => {
            if (err !== null) {
                throw new Error(err.message);
            }
        });

        this.initialised = true;
    }

    public async createTable(tableName: string, columnParams: string): Promise<void> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        return new Promise((resolve, reject) => {
            const sqlQuery: string = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnParams})`;
            this.db.run(sqlQuery,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(`${err}. Query: ${sqlQuery}`);
                    }
                    resolve();
                }
            )
        });
    }

    public async insertValues(tableName: string, columns: string, values: string[]): Promise<number> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        const tableExists: boolean = await this.doesTableExist(tableName);
        if (!tableExists) {
            return Promise.reject("Table to insert does not exist");
        }

        if (values.length > 100) {
            return Promise.reject("Unable to insert more than 100 values at once");
        }

        const valueQueryString = values.map(value => '(' + value + ')').join();

        return new Promise((resolve, reject) => {
            const sqlQuery: string = `INSERT INTO ${tableName} (${columns}) VALUES ${valueQueryString}`;
            this.db.run(sqlQuery,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(`${err}. Query: ${sqlQuery}`);
                    }
                    resolve(this?.lastID);
                }
            )
        })
    }

    public async selectValues(tableName: string, conditions: string): Promise<any[]> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        const tableExists: boolean = await this.doesTableExist(tableName);
        if (!tableExists) {
            return Promise.reject("Table to select into does not exist");
        }

        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${tableName} WHERE ${conditions}`,
                function (err: Error | null, rows: object[]) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            )
        });
    }

    public async selectValue(tableName: string, conditions: string): Promise<object> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        const tableExists: boolean = await this.doesTableExist(tableName);
        if (!tableExists) {
            return Promise.reject("Table to select into does not exist");
        }

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${tableName} WHERE ${conditions}`,
                function (err: Error | null, row: object) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                }
            )
        });
    }

    public async selectLimitedValues(tableName: string, conditions: string, limit: number): Promise<any[]> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        const tableExists: boolean = await this.doesTableExist(tableName);
        if (!tableExists) {
            return Promise.reject("Table to select into does not exist");
        }

        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${tableName} WHERE ${conditions} LIMIT ${limit}`,
                function (err: Error | null, rows: object[]) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            )
        });
    }

    public async updateValues(tableName: string, columns: string, conditions: string): Promise<number> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        const tableExists: boolean = await this.doesTableExist(tableName);
        if (!tableExists) {
            return Promise.reject("Table to update does not exist");
        }

        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${tableName} SET ${columns} WHERE ${conditions}`,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(this.changes);
                }
            )
        });
    }

    public async clearTable(tableName: string): Promise<void> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        return new Promise((resolve, reject) => {
            this.db.run(`TRUNCATE TABLE ${tableName}`,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            )
        });
    }

    public async deleteTable(tableName: string): Promise<void> {
        if (!this.initialised) {
            return Promise.reject("Database object not initialised");
        }

        return new Promise((resolve, reject) => {
            this.db.run(`DROP TABLE ${tableName}`,
                function (err: Error | null) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    console.log("drop sql query run");
                    resolve();
                }
            )
        });
    }

    public async doesTableExist(tableName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
                function (err: Error | null, row) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    resolve(row != null);
                }
            );
        });
    }

    /**
     * Replaces single apostrophes with double apostrophes for SQL safety.
     * 
     * @param value the string to be sanitised
     * @returns a sanitised string that can be used in SQL queries
     */
    public sanitiseValuesForSql(value: string): string {
        return value.replace(/'/g, "''");
    }
}

export default DatabaseController;