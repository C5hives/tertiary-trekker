import SearchResult from "../../types/SearchResult";

interface DocumentIdProps {
    id: string;
    setSimilarDocuments: (documents: SearchResult[]) => void;
}

export default DocumentIdProps;