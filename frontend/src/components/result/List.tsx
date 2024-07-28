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
  return (
    <Box>
      <Typography variant = 'body2' sx = {{ fontStyle: 'italic', color: 'grey', paddingLeft: 1 }}>Displaying {results.length} result{results.length > 1 ? 's' : ''}</Typography>
      {results.map((result: SearchResult) => (
        <ListItem key = {result.id} result = {result} setResponse = {setResponse} />
      ))}
    </Box>
  );
};
