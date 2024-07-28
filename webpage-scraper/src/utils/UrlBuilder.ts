class UrlBuilder {
    /**
     * Removes anchors and query parameters from a url.
     *
     * @remarks
     * If an invalid url is provided, an empty string is returned.
     *
     * @param url - The url to be cleaned
     * @returns A cleaned url
     */
    public static cleanUrl(url: string): string {
        if (!URL.canParse(url)) {
            return '';
        }
        // special case to handle
        if (url === 'javascript:void(0)') {
            return '';
        }

        url = UrlBuilder.removeAnchors(url);
        url = UrlBuilder.removeQueryStrings(url);
        return url;
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
    public static buildFullUrl(url: string, base: string): string {
        if (!URL.canParse(url, base)) {
            return '';
        }
        return new URL(url, base).toString();
    }

    /**
     * Removes the first anchor in the url.
     *
     * @param url - A url with an anchor
     * @returns - A url without anchor links
     */
    private static removeAnchors(url: string): string {
        return url.split('#')[0];
    }

    /**
     * Removes query strings from the url.
     *
     * @param url - A url with query strings
     * @returns - A url without query strings
     */
    private static removeQueryStrings(url: string): string {
        return url.split('?')[0];
    }
}

export default UrlBuilder;
