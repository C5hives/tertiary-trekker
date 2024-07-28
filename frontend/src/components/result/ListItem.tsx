import { Card, CardContent } from '@mui/material';
import { ReactElement } from 'react';
import BodyText from './BodyText';
import ListItemHeader from './ListItemHeader';
import SearchResult from '../../types/SearchResult';
import Response from "../../types/Response";

interface ListItemProps {
  result: SearchResult;
  setResponse: (response: Response) => void;
}

export default function ListItem ({ result, setResponse }: ListItemProps): ReactElement {
  return (
    <Card style={{ backgroundColor: "#EEEDEB" }} variant = 'outlined' sx = {{ margin: 1 }}>
      <CardContent sx= {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '3px',
        padding: 2,
        "&:last-child": {
          paddingBottom: 2,
        }
      }}>
          <ListItemHeader result = {result} setResponse = {setResponse}></ListItemHeader>
          <BodyText content = { result.content }></BodyText>
      </CardContent>
    </Card>
  );
};
