import { ReactElement } from 'react';
import ListItem from './ListItem';
import { Box } from '@mui/material';
import SearchResult from '../../types/SearchResult';

interface DocumentListProps {
  results: SearchResult[];
}

export default function List({ results }: DocumentListProps): ReactElement{
  if (results) {
    return (
      <Box>
        {results.map((result: SearchResult) => (
          <ListItem key = {result.id} result = {result} />
        ))}
      </Box>
    );
  } else {
    return (
      <Box>Nothing to see here!</Box>
    )
  }
};
