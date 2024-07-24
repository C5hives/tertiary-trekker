import { ReactElement } from 'react';
import { Card, CardContent } from '@mui/material';
import DocumentInfoProps from '../props/DocumentInfoProps';
import ListItemHeader from './ListItemHeader';
import BodyText from './BodyText';

export default function ListItem ({ result }: DocumentInfoProps): ReactElement {
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
          <ListItemHeader result = {result}></ListItemHeader>
          <BodyText content = { result.content }></BodyText>
      </CardContent>
    </Card>
  );
};
