import { ReactElement } from 'react';
import { Box } from '@mui/material';
import DocumentListProps from '../../props/DocumentListProps';
import SearchResult from '../../../types/SearchResult';
import SimilarDocument from './SimilarDocument';

export default function SimilarDocumentList({ results }: DocumentListProps): ReactElement{
  return (
    <Box sx = {{
        overflow: 'auto',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        width: '100%',
        flexGrow: 50
    }}>
      {results.map((result: SearchResult) => (
        <SimilarDocument key = {result.id} result = {result} />
      ))}
    </Box>
  );
};
