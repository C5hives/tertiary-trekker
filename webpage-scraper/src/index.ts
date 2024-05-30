import CrawlJob from './lib/CrawlJob.js';

async function run(): Promise<void> {
  const job = new CrawlJob("C:\\Users\\kokbo\\Downloads");
  await job.run();
  return;
}

run();