import path from 'path';
import fs from 'fs';

class WebpageDownloader {
    public static async saveToFile(savePath: string, url: string, content: string): Promise<void> {
        // TODO: should probably throw the error instead of catching here
        try{
            const filePath = WebpageDownloader.determineFilePath(url, savePath);
            // create a folder to save the html file to based on the path in the url
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            // save parsed content to a html file
            await fs.promises.writeFile(filePath, content, 'utf-8');

            console.log(`File saved as: ${filePath}`);
        } catch (error) {
            console.error(error);
        }
        return;
    }

    private static determineFilePath(url: string, savePath: string): string {
        const urlObject = new URL(url);
        
        // remove trailing slash in path name if any
        let pathName = urlObject.pathname;
        if (pathName.charAt(pathName.length - 1) === '/') {
            pathName = pathName.slice(0, pathName.length - 1);
        }
        
        // determine the name for the html file,
        // then replace '/' with '\' to fit with file path syntax
        let relativePath = (pathName === '' ? 'index.html' : `${pathName}.html`)
            .replace(/\//g, path.sep);
        
        return path.join(savePath, urlObject.hostname, relativePath);
    }
}

export default WebpageDownloader;