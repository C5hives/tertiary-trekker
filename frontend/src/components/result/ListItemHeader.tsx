import { Box } from '@mui/material';
import { ReactElement } from 'react';
import DetailsButton from './DetailsButton';
import SearchResult from '../../types/SearchResult';
import TitleText from './TitleText';
import Response from "../../types/Response";

interface ListItemHeaderProps {
    result: SearchResult;
    setResponse: (response: Response) => void;
}

export default function ListItemHeader ({ result, setResponse }: ListItemHeaderProps): ReactElement {
    return (
        <Box sx = {{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            overflow: 'hidden',
        }}>
            <TitleText url = {result.url} title = {result.title}></TitleText>
            <DetailsButton result = {result} setResponse = {setResponse}></DetailsButton>
        </Box>
    );
};

