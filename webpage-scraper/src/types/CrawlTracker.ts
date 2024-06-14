import CrawlLinkManager from "../lib/CrawlLinkManager";
import ExcludeLinkManager from "../lib/ExcludeLinkManager";

type CrawlTracker = {
    include: CrawlLinkManager,
    exclude: ExcludeLinkManager
};

export default CrawlTracker;