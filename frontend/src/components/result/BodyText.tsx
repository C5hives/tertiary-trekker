import { ReactElement } from 'react';
import { Typography } from '@mui/material';

import BodyDataProps from '../props/BodyDataProps';

export default function BodyText (bodyData: BodyDataProps): ReactElement {
    return (
        <Typography
            variant="body2"
            color = "text.secondary"
            sx = {{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                width: '100%'
            }}
        >
            {bodyData.content}
        </Typography>
    );
};
