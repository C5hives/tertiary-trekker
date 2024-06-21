// custom classes
import CrawlUrlManager from '../lib/databaseManagers/CrawlUrlManager';
import BlacklistUrlManager from '../lib/databaseManagers/BlacklistUrlManager';

type CrawlTracker = {
    include: CrawlUrlManager;
    exclude: BlacklistUrlManager;
};

export default CrawlTracker;
