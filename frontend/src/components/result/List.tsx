import { Box, Typography } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import ListItem from './ListItem';
import SearchResult from '../../types/SearchResult';
import Response from "../../types/Response";

interface ListProps {
  results: SearchResult[];
  setResponse: (response: Response) => void;
}

export default function List({ results, setResponse }: ListProps): ReactElement{
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const seen = new Set<string>();
    const uniqueResults = results.filter(document => {
      const isDuplicate = seen.has(document.id);
      seen.add(document.id);
      return !isDuplicate;
    });
    setFilteredResults(uniqueResults);
  }, [results]);
  
  return (
    <Box>
      <Typography variant = 'body2' sx = {{ fontStyle: 'italic', color: 'grey', paddingLeft: 1 }}>Displaying {results.length} result{results.length > 1 ? 's' : ''}</Typography>
      {filteredResults.map((result: SearchResult) => (
        <ListItem key = {result.id} result = {result} setResponse = {setResponse} />
      ))}
    </Box>
  );
};
