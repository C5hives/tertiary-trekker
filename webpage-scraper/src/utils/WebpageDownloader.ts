// npm packages
import path from 'path';
import fs from 'fs';

// custome classes
import UrlUtils from './UrlUtils';
import { appLogger } from './logger';

class WebpageDownloader {
    /**
     * Saves the contents of a html file to the specified folder.
     *
     * @param savePath - The folder path to save the file to
     * @param url - The original url of the html content
     * @param content - The contents of a html file
     */
    public static async saveToFile(savePath: string, url: string, content: string): Promise<void> {
        let filePath: string = '';
        try {
            filePath = WebpageDownloader.determineFilePath(savePath, url);

            // creates a destination folder to save the html file to
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

            // save parsed content to a html file
            await fs.promises.writeFile(filePath, content, 'utf-8');
        } catch (err) {
            throw new Error(`Failed to save ${url} to a file. ${err}`);
        }

        return;
    }

    /**
     * Constructs a file path to save webpage content.
     *
     * @remarks
     * The generated file path is derived relative to the original url path of the webpage.
     *
     * @param url - The original url of the html content
     * @param savePath - The folder path to save the file to
     * @returns An absolute file path
     */
    private static determineFilePath(savePath: string, url: string): string {
        const urlObject: URL = new URL(url);

        // remove trailing slash in path name if any
        let pathName: string = urlObject.pathname;
        if (pathName.charAt(pathName.length - 1) === '/') {
            pathName = pathName.slice(0, pathName.length - 1);
        }

        // determine the name for the html file,
        let relativePath = '';
        if (pathName === '') {
            relativePath = 'index.html';
        } else if (UrlUtils.isHtml(pathName)) {
            relativePath = pathName;
        } else {
            relativePath = `${pathName}\\index.html`;
        }

        // replace '/' with '\' to fit with file path syntax
        relativePath = relativePath.replace(/\//g, path.sep);
        const filePath: string = path.join(savePath, urlObject.hostname, relativePath);

        appLogger.info(`Filepath for ${url} is ${filePath}`);

        return filePath;
    }
}

export default WebpageDownloader;
