import CrawlJob from './lib/CrawlJob';

import ExcludedLinkManager from "./lib/ExcludeLinkManager";

async function run() {
    try {
        const job: CrawlJob = new CrawlJob("test");
        job.crawl(1000);
    } catch (err) {
        console.log(err);
    }
}

run();