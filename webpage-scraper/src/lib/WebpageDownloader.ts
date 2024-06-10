import path from 'path';
import fs from 'fs';

class WebpageDownloader {
    /**
     * Saves the contents of a html file to the specified folder.
     *
     * @param savePath - The folder path to save the file to
     * @param url - The original url of the html content
     * @param content - The contents of a html file
     */
    public static async saveToFile(savePath: string, url: string, content: string): Promise<void> {
        // TODO: should probably throw the error instead of catching here
        try {
            const filePath = WebpageDownloader.determineFilePath(url, savePath);

            // creates a destination folder to save the html file to
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

            // save parsed content to a html file
            await fs.promises.writeFile(filePath, content, 'utf-8');

            // console.log(`[INFO] File saved as: ${filePath}`);
        } catch (error) {
            console.error(error);
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
    private static determineFilePath(url: string, savePath: string): string {
        const urlObject = new URL(url);

        // remove trailing slash in path name if any
        let pathName = urlObject.pathname;
        if (pathName.charAt(pathName.length - 1) === '/') {
            pathName = pathName.slice(0, pathName.length - 1);
        }

        // determine the name for the html file,
        let relativePath = 'index.html';
        // if (pathName === '') {
        //     relativePath = 'index.html';
        // } else {
        //     relativePath = `${pathName}.html`;
        // }

        // replace '/' with '\' to fit with file path syntax
        relativePath = relativePath.replace(/\//g, path.sep);

        return path.join(savePath, urlObject.hostname, relativePath);
    }
}

export default WebpageDownloader;
