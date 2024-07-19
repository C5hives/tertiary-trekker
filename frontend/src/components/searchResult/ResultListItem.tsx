import { ReactElement } from 'react';
import { Card, CardContent } from '@mui/material';
import '../../styles/searchResult/ResultListItem.css';
import SearchResultProps from '../props/SearchResultProps';
import ResultListItemHeader from './ResultListItemHeader';
import BodyText from './BodyText';

export default function ResultListItem ({ result }: SearchResultProps): ReactElement {
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
          <ResultListItemHeader result = {result}></ResultListItemHeader>
          <BodyText content = { result.content }></BodyText>
      </CardContent>
    </Card>
  );
};
