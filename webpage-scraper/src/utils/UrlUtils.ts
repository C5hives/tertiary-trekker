import * as mime from 'mime-types';

class UrlUtils {
    /**
     * Removes anchors and query parameters from a url.
     *
     * @param url - The url to be cleaned
     * @returns A cleaned url
     */
    public static cleanUrl(url: string, base: string): string {
        if (!URL.canParse(url)) {
            // attempt to build an absolute url
            url = UrlUtils.buildFullUrl(url, base);
        }

        const urlObj: URL = new URL(url);

        urlObj.protocol = 'https'; // convert all links to https
        urlObj.hash = ''; // remove anchors from url
        urlObj.search = ''; // remove search parameters from url

        return urlObj.toString();
    }

    /**
     * Constructs a valid url using a base and a url.
     *
     * @remarks
     * If the url provided is a relative url, it is appended to the base provided to form a valid url.
     *
     * @param url - A relative or absolute url
     * @param base - A url containing a domain.
     * @returns An absolute url
     */
    private static buildFullUrl(url: string, base: string): string {
        if (!URL.canParse(url, base)) {
            throw new Error(`Failed to build full url from url: ${url} & base: ${base}`);
        }
        return new URL(url, base).toString();
    }

    public static isMimeType(url: string): boolean {
        return !(mime.lookup(url) === false);
    }

    public static isHtml(url: string): boolean {
        return mime.lookup(url) === 'text/html';
    }
}

export default UrlUtils;
