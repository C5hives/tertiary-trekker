import { Box, Card, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import SimilarDocumentList from "./SimilarDocumentList";
import FindSimilarButton from "./FindSimilarButton";
import SearchResult from "../../../types/SearchResult";

export default function SimilarDocumentRightPanel({ id }: { id: string }): ReactElement {
    const [similarDocuments, setSimilarDocuments] = useState<SearchResult[]>([]);
    
    return (
        <Card sx = {{
            height: '100%',
            width: '35%',
            boxSizing: 'border-box',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
        }}>
            <Box sx = {{
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'left',
                gap: '6px',
                padding: 1
            }}>
                <Typography variant="h6">Similar Documents</Typography>
                <SimilarDocumentList results = {similarDocuments}></SimilarDocumentList>
                <FindSimilarButton id = {id} setSimilarDocuments = {setSimilarDocuments}></FindSimilarButton>
            </Box>
        </Card>
        
        
    );
}