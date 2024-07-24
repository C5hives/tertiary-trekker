import { ReactElement } from "react";
import Button from "@mui/material/Button";
import DocumentIdProps from "../../props/DocumentIdProps";
import { searchForSimilarDocuments } from "../../../search/search";

export default function FindSimilarButton ({ id, setSimilarDocuments }: DocumentIdProps): ReactElement {
    const handleSearch = () => {
        const similarDocuments = searchForSimilarDocuments(id);
        setSimilarDocuments(similarDocuments);
    }

    return (
        <Button
            onClick = { handleSearch }
            variant = "contained"
            color = "primary"
            sx = {{
                width: '100%',
                height: '10%',
                padding: '0',
                margin: '0',
                '& .MuiButton-startIcon': {
                    margin: '0',
                },
                '& .MuiSvgIcon-root': {
                    fontSize: '16px',
                },
            }}
        >
            Find Similar Documents
        </Button>
      );
}