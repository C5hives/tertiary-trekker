import { ReactElement } from 'react';
import ResultListItem from './ResultListItem';
import { Box } from '@mui/material';
import SearchResultListProps from '../props/SearchResultListProps';

export default function ResultList({ results }: SearchResultListProps): ReactElement{
  return (
    <Box>
      {results.map((result) => (
        <ResultListItem key = {result.id} result = {result} />
      ))}
    </Box>
  );
};
