// custom classes
import CrawlLinkManager from '../lib/databaseManagers/CrawlLinkManager';
import ExcludeLinkManager from '../lib/databaseManagers/ExcludeLinkManager';

type CrawlTracker = {
    include: CrawlLinkManager;
    exclude: ExcludeLinkManager;
};

export default CrawlTracker;
