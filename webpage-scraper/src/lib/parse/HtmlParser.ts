// npm packages
import * as cheerio from 'cheerio';
import beautify from 'js-beautify';

// custome classes
import { appLogger } from '../../utils/logger';
import UrlCleaner from './UrlCleaner';

class HtmlParser {
    private baseUrl: string;
    private content: string;

    public constructor(baseUrl: string, content: string) {
        this.baseUrl = baseUrl;
        this.content = content;
    }

    public getCleanHtml(): string {
        const content: string = this.removeUnneededTags();
        return beautify.html(content);
    }

    private removeUnneededTags(): string {
        const $ = cheerio.load(this.content);
        $('script').remove(); // remove <script> tags
        $('noscript').remove(); // remove <noscript> tags
        $('link').remove(); // remove <link> tags
        $('style').remove(); // remove <style> tags

        return $.html();
    }

    public getUniqueUrlsInHtml(): string[] {
        // a set is used here to prevent duplicates after parsing
        const uniqueUrls: Set<string> = new Set<string>();
        const $ = cheerio.load(this.content);
        // find <a> tags in the html and save their href attribute
        $('a').each(function () {
            const link: string | undefined = $(this).attr('href');
            if (link === undefined || link.includes('javascript')) {
                return;
            }
            uniqueUrls.add(link);
        });

        const rawUrls: string[] = Array.from(uniqueUrls.values());
        return this.buildUrls(rawUrls);
    }

    private buildUrls(rawUrls: string[]): string[] {
        const cleanUrls: Set<string> = new Set<string>();
        for (const url of rawUrls) {
            try {
                const cleanUrl = UrlCleaner.cleanUrl(url, this.baseUrl);
                cleanUrls.add(cleanUrl);
            } catch (err) {
                appLogger.warn(`Failed to clean url ${url}. ${err}`);
            }
        }
        return Array.from(cleanUrls.values());
    }
}

export default HtmlParser;
