import { ReactElement } from "react";
import DocumentInfoProps from "../../props/DocumentInfoProps";
import { Box, Typography } from "@mui/material";
import BodyText from "./BodyText";
import TitleText from "./TitleText";

export default function DocumentInfoLeftPanel ({ result }: DocumentInfoProps): ReactElement {
    return (
        <Box sx = {{
            height: '100%',
            width: '65%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'left',
            gap: '6px',
            padding: 0
        }}>
            <Box sx = {{ paddingLeft: 2 }}>
                <Typography variant="h6">Title</Typography>
            </Box>
            <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2 }}>
                <TitleText url = {result.url} title = {result.title}></TitleText>
            </Box>
            <Box sx = {{ paddingLeft: 2, marginTop: 1 }}>
                <Typography variant="h6">Category</Typography>
            </Box>
            <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2 }}>
                <Typography variant="body2">{result.category}</Typography>
            </Box>
            <Box sx = {{ paddingLeft: 2, marginTop: 1 }}>
                <Typography variant="h6">Content</Typography>
            </Box>
            <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2, flexGrow: 50 }}>
                <BodyText content = { result.content }></BodyText>
            </Box>
        </Box>
    );
};