import { ReactElement } from "react";
import { Box, Typography } from "@mui/material";
import BodyText from "./BodyText";
import TitleText from "./TitleText";
import UrlText from "./UrlText";
import SearchResult from "../../../types/SearchResult";

interface LeftPanelProps {
    result: SearchResult;
}

export default function LeftPanel ({ result }: LeftPanelProps): ReactElement {
    return (
        <Box sx = {{
            height: '100%',
            width: '64%',
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
                <TitleText title = {result.title}></TitleText>
            </Box>
            <Box sx = {{
                display: 'flex',
                flexDirection: 'row',
                gap: '2%',
                boxSizing: 'border-box',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
            }}>
                <Box sx = {{
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '20%',
                }}>
                    <Box sx = {{ paddingLeft: 2, paddingRight: 2, paddingTop: 1, overflow: 'hidden' }}>
                        <Typography variant="h6">Category</Typography>
                    </Box>
                    <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2, overflow: 'hidden' }}>
                        <Typography variant="body2">{result.category}</Typography>
                    </Box>
                </Box>
                <Box sx = {{
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '78%',
                }}>
                    <Box sx = {{ paddingLeft: 2, paddingRight: 2, paddingTop: 1, overflow: 'hidden' }}>
                        <Typography variant="h6">Url</Typography>
                    </Box>
                    <Box sx = {{ border: '1px solid grey', padding: 2, borderRadius: 2 }}>
                        <UrlText url = {result.url}></UrlText>
                    </Box>
                </Box>
            </Box>
            <Box sx = {{ paddingLeft: 2, paddingTop: 1, overflow: 'hidden' }}>
                <Typography variant="h6">Content</Typography>
            </Box>
            <Box sx = {{
                border: '1px solid grey',
                padding: 2,
                borderRadius: 2,
                flexGrow: 1,
                overflow: 'hidden'
            }}>
                <BodyText content = { result.content }></BodyText>
            </Box>
        </Box>
    );
};