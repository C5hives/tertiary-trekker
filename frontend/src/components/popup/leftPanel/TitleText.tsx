import { ReactElement } from 'react';
import { Typography } from '@mui/material';

interface TitleTextProps {
    title: string
}

export default function TitleText ({ title }: TitleTextProps): ReactElement {
    return (
        <Typography variant = "body2"
            component = "div"
            sx= {{
                overflow: 'auto',
                textOverflow: 'clip',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
            }}
        >
            { title }
        </Typography>
    );
};
