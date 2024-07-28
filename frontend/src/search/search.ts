import Response from "../types/Response";
import SearchResult from "../types/SearchResult";
import axios, { AxiosError, AxiosResponse } from "axios";

const categories = ['nus', 'ntu', 'smu', 'sutd', 'sit', 'suss'];

const mockResults: SearchResult[] = Array.from({ length: 100 }, (_, index) => ({
    id: (index + 1).toString(),
    url: `https://example.com/${index + 1}`,
    category: categories[index % categories.length],
    title: `Example Title ${index + 1} ${getRandomWords(20)}`,
    content: `Example content ${index + 1}... ${getRandomWords(100)}`,
}));

function getRandomWords(num: number): string {
  const words = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut",
    "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
    "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in",
    "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa",
    "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];
  return Array.from({ length: num }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

async function searchForDocumentWithText(text: string): Promise<[Response, Map<string, SearchResult[]>]> {
    const documentMap: Map<string, SearchResult[]> = new Map();
    let httpResponse: Response = {code: 200, message: 'OK'}
    const serverUrl: string = `https://tertiary-trekker-backend.onrender.com/api/search?term=${text}`;

    try {
        const response: AxiosResponse = await axios.get(serverUrl);
        httpResponse = handleResponseMessage(response.status);
        
        for (const document of response.data) {
            if (documentMap.has(document.category)) {
                documentMap.get(document.category)!.push(document);
            } else {
                documentMap.set(document.category, [document]);
            }
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            const status: number = axiosError.response.status;
            httpResponse = handleResponseMessage(status);
        }
    }
    return [httpResponse, documentMap];
}

async function searchForSimilarDocuments(id: string): Promise<[Response, SearchResult[]]> {
    let httpResponse: Response = {code: 200, message: 'OK'}
    const serverUrl: string = `https://tertiary-trekker-backend.onrender.com/api/MLTsearch?id=${id}`;

    try {
        const response: AxiosResponse = await axios.get(serverUrl);
        httpResponse = handleResponseMessage(response.status);
        return [httpResponse, response.data];
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            const status: number = axiosError.response.status;
            httpResponse = handleResponseMessage(status);
        }
    }
    return [httpResponse, []];
}

function handleResponseMessage(code: number): Response {
    if (code >= 200 && code <= 299) {
        return { code: code, message: 'OK.'};
    } else if (code >= 400 && code <= 599) {
        return { code: code, message: 'Something went wrong with the server. Please try again later.'};
    } else {
        return { code: code, message: 'Something went wrong. Please try again later.'};
    }
}

export {
  searchForDocumentWithText,
  searchForSimilarDocuments
};