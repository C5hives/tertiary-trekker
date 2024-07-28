import { Box, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import SimilarDocumentList from "./SimilarDocumentList";
import FindSimilarButton from "./FindSimilarButton";
import SearchResult from "../../../types/SearchResult";
import Response from '../../../types/Response';

interface RightPanelProps {
    id: string
    setResponse: (response: Response) => void;
}

export default function RightPanel({ id, setResponse }: RightPanelProps): ReactElement {
    const [similarDocuments, setSimilarDocuments] = useState<SearchResult[]>([]);
    const [searched, setSearched] = useState<boolean>(false);

    return (
        <Box sx = {{
            height: '100%',
            width: '34%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'left',
            gap: '6px',
        }}>
            <Typography variant="h6">Similar Documents</Typography>
            {searched ? <SimilarDocumentList results = {similarDocuments}></SimilarDocumentList>
                      : <FindSimilarButton id = {id} setSimilarDocuments = {setSimilarDocuments} setSearched = {setSearched} setResponse = {setResponse}></FindSimilarButton>}
        </Box>
    );
}