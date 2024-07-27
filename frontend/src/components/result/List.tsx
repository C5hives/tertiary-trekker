import { Box } from '@mui/material';
import { ReactElement } from 'react';
import ListItem from './ListItem';
import SearchResult from '../../types/SearchResult';

interface ListProps {
  results: SearchResult[];
}

export default function List({ results }: ListProps): ReactElement{
  return (
    <Box>
      {results.map((result: SearchResult) => (
        <ListItem key = {result.id} result = {result} />
      ))}
    </Box>
  );
};
