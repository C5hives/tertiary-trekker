import CrawlJob from './lib/CrawlJob';
import LinkTracker from './lib/LinkTracker';

async function run() {
    try {
        const job = new CrawlJob("test");
        await job.run();
    } catch (err) {
        console.log(err);
    }
}

run();