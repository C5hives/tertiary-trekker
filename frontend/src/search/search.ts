import SearchResult from "../types/SearchResult";

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

function searchForDocumentWithText(text: string): Map<string, SearchResult[]> {
    const documentMap = new Map<string, SearchResult[]>();
    for (const document of mockResults) {
      if (documentMap.has(document.category)) {
        documentMap.get(document.category)!.push(document);
      } else {
        documentMap.set(document.category, [document]);
      }
    }
    return documentMap;
}

function searchForSimilarDocuments(id: string): SearchResult[] {
    console.log(id);
    return mockResults;
}

export {
  searchForDocumentWithText,
  searchForSimilarDocuments
};