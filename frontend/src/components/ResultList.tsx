import { ReactElement } from 'react';
import SearchResult from '../types/SearchResult';
import ListItem from './ListItem';
import { Box } from '@mui/material';

interface ResultListProps {
  results: SearchResult[];
}

export default function ResultList({ results }: ResultListProps): ReactElement{
  return (
    <Box>
      {results.map((result) => (
        <ListItem key = {result.id} result = {result} />
      ))}
    </Box>
  );
};
