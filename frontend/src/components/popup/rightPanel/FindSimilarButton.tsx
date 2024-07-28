import { ReactElement, useState } from "react";
import Button from "@mui/material/Button";
import { searchForSimilarDocuments } from "../../../search/search";
import SearchResult from "../../../types/SearchResult";
import Response from '../../../types/Response';
import { CircularProgress } from "@mui/material";

interface SimilarButtonProps {
    id: string;
    setSimilarDocuments: (documents: SearchResult[]) => void;
    setSearched: (searched: boolean) => void;
    setResponse: (response: Response) => void;
}

export default function FindSimilarButton ({ id, setSimilarDocuments, setSearched, setResponse }: SimilarButtonProps): ReactElement {
    const [loading, setLoading] = useState(false);
    const handleSearch = () => {
        setLoading(true);
        searchForSimilarDocuments(id)
            .then(([response, documents] : [Response, SearchResult[]]) => {
                setResponse(response);
                setSimilarDocuments(documents);
                setSearched(true);
                setLoading(false);
            });
    }

    return (
        <Button
            onClick = { handleSearch }
            variant = "contained"
            color = "primary"
            startIcon = {
                loading ? (<CircularProgress color = "inherit" size = {20} />) : undefined
            }
            disabled = {loading}
            sx = {{
                width: '100%',
                height: '7%',
                padding: '0',
                margin: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                "& .MuiButton-startIcon": {
                    margin: "0px"
                },
            }}
        >
            {loading ? "" : "Find Similar"}
        </Button>
      );
}