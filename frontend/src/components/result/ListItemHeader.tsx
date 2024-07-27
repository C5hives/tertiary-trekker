import { Box } from '@mui/material';
import { ReactElement } from 'react';
import DetailsButton from './DetailsButton';
import SearchResult from '../../types/SearchResult';
import TitleText from './TitleText';

interface ListItemHeaderProps {
    result: SearchResult;
  }

export default function ListItemHeader ({ result }: ListItemHeaderProps): ReactElement {
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
            <DetailsButton result = {result}></DetailsButton>
        </Box>
    );
};

