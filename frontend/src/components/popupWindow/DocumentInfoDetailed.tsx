import { ReactElement } from "react";
import SearchResultProps from "../props/SearchResultProps";
import { Box, Typography } from "@mui/material";
import BodyText from "./BodyText";
import TitleText from "./TitleText";

export default function DocumentInfoDetailed ({ result }: SearchResultProps): ReactElement {
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
            <Box sx = {{ paddingLeft: 2, marginTop: 2 }}>
                <Typography variant="h6">Title</Typography>
            </Box>
            <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2 }}>
                <TitleText url = {result.url} title = {result.title}></TitleText>
            </Box>
            <Box sx = {{ paddingLeft: 2, marginTop: 2 }}>
                <Typography variant="h6">Content</Typography>
            </Box>
            <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2, flexGrow: 50 }}>
                <Box >
                    <BodyText content = { result.content }></BodyText>
                </Box>
            </Box>
        </Box>
    );
};