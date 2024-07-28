import { ReactElement } from 'react';
import { Link, Typography } from '@mui/material';

interface TitleTextProps {
    url: string
    title: string
}

export default function TitleText ({ url, title }: TitleTextProps): ReactElement {
    return (
        <Typography variant = "h6"
            component = "div"
            sx= {{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
        >
            <Link href = {url} target="_blank" rel="noopener">
                { title }
            </Link>
        </Typography>
    );
};
