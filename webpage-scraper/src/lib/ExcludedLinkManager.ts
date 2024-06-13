import DatabaseController from '../utils/DatabaseController';
import UrlToExclude from '../types/UrlToExclude';

class ExcludedLinkManager {
    private controller: DatabaseController;
    private tableName: string;

    public constructor(controller: DatabaseController, tableName: string) {
        this.controller = controller;
        this.tableName = tableName;
    }

    public async getExcludedLinks(university: string): Promise<string[]> {
        await this.ensureTableExists();

        const condition: string = `category='${university}' OR category='global'`;
        const result: UrlToExclude[] = await this.controller.selectValues(this.tableName, condition) as UrlToExclude[];

        return result.map(linkToExclude => linkToExclude.url);
    }

    public async insertExcludedLinks(urls: string[], category: string): Promise<number> {
        await this.ensureTableExists();

        const columns: string = ['url', 'category'].join();
        const values: string[] = urls.map(this.controller.sanitiseValuesForSql)
            .map(url => `'${url}', '${category}'`);

        const rowsInserted: number = await this.controller.insertValues(this.tableName, columns, values);
        return rowsInserted;
    }

    private async ensureTableExists(): Promise<boolean> {
        const tableExists: boolean = await this.controller.doesTableExist(this.tableName);
        if (!tableExists) {
            try {
                await this.createTable();
            } catch (err) {
                console.log(`Failed to create table due to ${err}`);
            }
            return false;
        }
        return true;
    }

    private async createTable(): Promise<void> {
        return await this.controller.createTable(this.tableName,
            `url VARCHAR(255),
            category VARCHAR(255),
            UNIQUE (url, category) ON CONFLICT IGNORE`
        );
    }
}

export default ExcludedLinkManager;