// npm packages
import * as mime from 'mime-types';

class UrlFilter {
    private blacklistedUrls: Set<string>;
    private urlPatterns: string[];

    public constructor() {
        this.blacklistedUrls = new Set<string>();
        this.urlPatterns = [];
    }

    public setUrlPatterns(urlPatterns: string[]) {
        this.urlPatterns = urlPatterns;
    }

    public setBlacklistedUrls(blacklistedUrls: string[]) {
        this.blacklistedUrls = new Set<string>(blacklistedUrls);
    }

    public containsUrlPattern(url: string): boolean {
        for (const pattern of this.urlPatterns) {
            if (url.includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    public isBlacklisted(url: string): boolean {
        for (const blacklistedUrl of this.blacklistedUrls) {
            if (url.startsWith(blacklistedUrl)) {
                return true;
            }
        }
        return false;
    }

    public pointsToHtmlFile(url: string): boolean {
        return !this.isMimeType(url) || this.isHtml(url);
    }

    private isMimeType(url: string): boolean {
        return !(mime.lookup(url) === false);
    }

    public isHtml(url: string): boolean {
        return mime.lookup(url) === 'text/html';
    }
}

export default UrlFilter;
