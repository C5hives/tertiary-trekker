import { ReactElement } from 'react';
import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import SearchResult from '../../../types/SearchResult';

interface SimilarDocumentProps {
  result: SearchResult;
}

export default function SimilarDocument ({ result }: SimilarDocumentProps): ReactElement {
  return (
    <Card style={{ backgroundColor: "#EEEDEB" }} variant = 'outlined' sx = {{ marginBottom: 1 }}>
      <CardContent sx= {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'left',
        gap: '3px',
        padding: 2,
        "&:last-child": {
          paddingBottom: 2,
        }
      }}>
          <Box sx = {{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Typography variant = "body1"
              component = "div"
              sx= {{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexGrow: 1
              }}
            >
              <Link href={result.url} target="_blank" rel="noopener">
                  { result.title }
              </Link>
            </Typography>
            <Typography
              variant = "body2"
              sx = {{
                border: '1px solid grey',
                padding: '1px',
                paddingLeft: 1,
                paddingRight: 1,
                borderRadius: 1
            }}>
              {result.category.toUpperCase()}
            </Typography>
          </Box>
          
          <Typography
              variant = "body2"
              color = "text.secondary"
              sx = {{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  width: '100%'
              }}
          >
              {result.content}
          </Typography>
      </CardContent>
    </Card>
  );
};
