import DatabaseController from "../utils/DatabaseController";
import UrlToCrawl from "../types/UrlToCrawl";
import ExcludedLinkManager from "./ExcludedLinkManager";
import JobDate from "../utils/JobDate";

class LinkTracker {
    private university: string;
    private controller: DatabaseController;

    private excludedLinkManager: ExcludedLinkManager;
    private excludedLinks: string[];
    private exclusionUpdated: boolean;

    public constructor(databaseFilePath: string, jobId: string, university: string) {
        this.university = university;
        this.controller = new DatabaseController(databaseFilePath, jobId);

        this.excludedLinkManager = new ExcludedLinkManager(this.controller, 'excluded');
        this.excludedLinks = [];
        this.exclusionUpdated = false;
    }

    public async doesUrlExist(url: string): Promise<boolean> {
        await this.ensureTableExists();

        url = this.controller.sanitiseValuesForSql(url);

        const link: UrlToCrawl = await this.controller.selectValue(this.university, `url = '${url}'`) as UrlToCrawl;
        return link != null;
    }

    public async getUnvisitedUrls(limit: number): Promise<string[]> {
        if (limit < 1) {
            return Promise.reject("Invalid limit provided");
        }

        await this.ensureTableExists();

        const result: UrlToCrawl[] = await this.controller.selectLimitedValues(this.university, "isVisited = 'FALSE'", limit);
        return result.map(urlToCrawl => urlToCrawl.url);
    }

    public async getAllUnvisitedUrls(): Promise<string[]> {
        await this.ensureTableExists();

        const result: UrlToCrawl[] = await this.controller.selectValues(this.university, "isVisited = 'FALSE'");
        return result.map(urlToCrawl => urlToCrawl.url);
    }

    public async insertNewUrlsToVisit(urls: string[]): Promise<number> {
        // only insert urls that are not blacklisted
        let values: string[] = [];
        for (const url of urls) {
            if (await this.isUrlExcluded(url)) {
                continue;
            }
            values.push(url);
        }

        values = values.map(this.controller.sanitiseValuesForSql)
            .map(url => `'${url}', 'FALSE'`);

        if (values.length < 1) {
            return Promise.resolve(0);
        }

        await this.ensureTableExists();
        const columns = ['url', 'isVisited'].join();

        let rowsInserted = 0;
        while(values.length > 0) {
            // split the array into subarrays with length 50 to work around the sql insert limit of 100
            const sqlInsertLimit = 100;
            const subArray: string[] = values.splice(0, sqlInsertLimit - 1);
            rowsInserted += await this.controller.insertValues(this.university, columns, subArray);
        }

        return rowsInserted;
    }

    public async isUrlExcluded(url: string): Promise<boolean> {
        if (!this.exclusionUpdated) {
            await this.updateExcludedLinks();
        }

        for (const excludedLink of this.excludedLinks) {
            if (url.startsWith(excludedLink)) {
                return true;
            }
        }
        return false;
    }

    private async updateExcludedLinks(): Promise<void> {
        this.excludedLinks = await this.excludedLinkManager.getExcludedLinks(this.university);
        this.exclusionUpdated = true;
    }

    public async markUrlAsVisited(url: string, outcome: string): Promise<number> {
        await this.ensureTableExists();

        const date: string = JobDate.getCurrentDateString();
        url = this.controller.sanitiseValuesForSql(url);

        const numberOfAffectedRows = await this.controller.updateValues(this.university,
            `isVisited = 'TRUE', visitTime = '${date}', outcome = '${outcome}'`,
            `url='${url}'`);

        return numberOfAffectedRows;
    }

    public async insertNewUrlsToExclude(urls: string[]): Promise<void> {
        await this.excludedLinkManager.insertExcludedLinks(urls, this.university);
    }

    private async ensureTableExists(): Promise<boolean> {
        const tableExists: boolean = await this.controller.doesTableExist(this.university);
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
        return await this.controller.createTable(this.university,
            `url VARCHAR(255),
            isVisited BOOLEAN,
            visitTime VARCHAR(255),
            outcome VARCHAR(10),
            UNIQUE (url) ON CONFLICT IGNORE`
        );
    }
}

export default LinkTracker;