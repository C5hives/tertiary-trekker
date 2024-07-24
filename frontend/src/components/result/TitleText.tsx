import { ReactElement } from 'react';
import { Typography, Link } from '@mui/material';

import TitleDataProps from '../props/TitleDataProps';

export default function TitleText ({ url, title }: TitleDataProps): ReactElement {
    return (
        <Typography variant = "h6"
            component = "div"
            sx= {{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
        >
            <Link href={url} target="_blank" rel="noopener">
                { title }
            </Link>
        </Typography>
    );
};
