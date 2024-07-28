import { ReactElement } from 'react';
import { Typography, Link } from '@mui/material';

interface UrlTextProps {
    url: string
}

export default function UrlText ({ url }: UrlTextProps): ReactElement {
    return (
        <Typography variant = "body2"
            component = "div"
            sx= {{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
            }}
        >
            <Link href={url} target="_blank" rel="noopener" sx = {{
                padding: 0,
                margin: 0,
                height: 'inherit',
                width: '100%'
            }}>
                { url }
            </Link>
        </Typography>
    );
};
