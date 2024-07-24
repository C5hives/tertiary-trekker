import { ReactElement } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import DocumentInfoProps from '../../props/DocumentInfoProps';
import BodyText from '../../result/BodyText';
import TitleText from '../../result/TitleText';

export default function SimilarDocument ({ result }: DocumentInfoProps): ReactElement {
  return (
    <Card style={{ backgroundColor: "#EEEDEB" }} variant = 'outlined' sx = {{ margin: 1 }}>
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
          <TitleText url = {result.url} title = {result.title}></TitleText>
          <Typography>{result.category}</Typography>
          <BodyText content = { result.content }></BodyText>
      </CardContent>
    </Card>
  );
};
