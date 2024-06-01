import Crawler from './Crawler';
import fs from 'fs';
import path from 'path';

// enum Universities {
//     NUS = "https://www.nus.edu.sg/", // flagged
//     NTU = "https://www.ntu.edu.sg/",
//     SIT = "https://www.singaporetech.edu.sg/",
//     SMU = "https://www.smu.edu.sg/", // flagged
//     SUSS = "https://www.suss.edu.sg/",
//     SUTD = "https://www.sutd.edu.sg/"
// }

class CrawlJob {
    private rootDirectory: string;

    public constructor(rootDirectory: string) {
        this.rootDirectory = rootDirectory;
    }

    public async run(): Promise<void> {
        const savePath = path.join(this.rootDirectory, CrawlJob.generateFolderName());
        const crawler: Crawler = new Crawler();

        // read links from some external file

        // const links: string[] = [
        //     Universities.NUS,
        //     Universities.NTU,
        //     Universities.SIT,
        //     Universities.SMU,
        //     Universities.SUSS,
        //     Universities.SUTD
        // ];
        const startingLinks = this.parseStartingLinks();
        const excludeLinks = this.parseLinksToExclude();

        await crawler.scrapeAll(savePath, {
            start: startingLinks,
            ignore: excludeLinks
        });
        return;
    }

    private static generateFolderName(): string {
        return 'crawl-job_' + CrawlJob.getCurrentDateAsString();
    }

    private parseLinksToExclude(): string[] {
        return fs.readFileSync('./config/exclude.txt').toString('utf8').split('\r\n');
    }

    private parseStartingLinks(): string[] {
        return fs.readFileSync('./config/visit.txt').toString('utf8').split('\r\n');
    }

    private static getCurrentDateAsString(): string {
        const currentDate: Date = new Date();
        const formatOptions: Intl.DateTimeFormatOptions = { hour12: false };

        const dateString: string = currentDate.toLocaleString('en-SG', formatOptions).replace(new RegExp('[/:]', 'g'), '-').replace(/,/g, '_').replace(/\s+/g, '');

        return dateString;
    }

    public changeRootDirectory(rootDirectory: string): void {
        this.rootDirectory = rootDirectory;
    }
}

export default CrawlJob;
