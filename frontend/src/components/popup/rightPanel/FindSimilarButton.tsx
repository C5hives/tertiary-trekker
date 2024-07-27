import { ReactElement } from "react";
import Button from "@mui/material/Button";
import { searchForSimilarDocuments } from "../../../search/search";
import SearchResult from "../../../types/SearchResult";

interface SimilarButtonProps {
    id: string;
    setSimilarDocuments: (documents: SearchResult[]) => void;
    setSearched: (searched: boolean) => void;
}

export default function FindSimilarButton ({ id, setSimilarDocuments, setSearched }: SimilarButtonProps): ReactElement {
    const handleSearch = () => {
        const similarDocuments = searchForSimilarDocuments(id);
        setSimilarDocuments(similarDocuments);
        setSearched(true);
    }

    return (
        <Button
            onClick = { handleSearch }
            variant = "contained"
            color = "primary"
            sx = {{
                width: '100%',
                height: '7%',
                padding: '0',
                margin: '0',
            }}
        >
            Find Similar
        </Button>
      );
}