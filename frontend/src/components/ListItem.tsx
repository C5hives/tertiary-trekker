import { ReactElement } from 'react';
import { Card, CardContent, Typography, Link, Stack } from '@mui/material';
import SearchResult from "../types/SearchResult";
import '../styles/ListItem.css';

interface SearchResultProps {
  result: SearchResult;
}

export default function ListItem ({ result }: SearchResultProps): ReactElement {
  return (
    <Card style={{ backgroundColor: "#EEEDEB" }} variant='outlined' sx = {{ margin: 1 }}>
      <CardContent sx={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Typography variant="h6" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>
            <Link href={result.url} target="_blank" rel="noopener">
              {result.title}
            </Link>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx = {{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical' }}
          >
            {result.content}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};
