class UrlBuilder {
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

    public static buildFullUrl(url: string, base: string): string {
        if (!URL.canParse(url, base)) {
            return '';
        }
        return new URL(url, base).toString();
    }

    private static removeAnchors(url: string): string {
        return url.split('#')[0];
    }

    private static removeQueryStrings(url: string): string {
        return url.split('?')[0];
    }
}

export default UrlBuilder;
