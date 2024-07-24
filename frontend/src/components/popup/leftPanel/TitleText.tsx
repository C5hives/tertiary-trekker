import { ReactElement } from 'react';
import { Typography, Link } from '@mui/material';

import TitleDataProps from '../../props/TitleDataProps';

export default function TitleText ({ url, title }: TitleDataProps): ReactElement {
    return (
        <Typography variant = "body2"
            component = "div"
            sx= {{
                overflow: 'auto',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
            }}
        >
            <Link href={url} target="_blank" rel="noopener">
                { title }
            </Link>
        </Typography>
    );
};
