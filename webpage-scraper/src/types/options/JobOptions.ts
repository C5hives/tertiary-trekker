type JobOptions = {
    linkLocation: string;
    databaseLocation: string;
    downloadRootDirectory: string;
    batchSizePerCrawl: number;
    crawlPeriodically: boolean;
    crawlFrequencyInMinutes: number;
};

export default JobOptions;
