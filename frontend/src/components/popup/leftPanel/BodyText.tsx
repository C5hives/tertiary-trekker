import { ReactElement } from 'react';
import { Typography } from '@mui/material';

import BodyDataProps from '../../props/BodyDataProps';

export default function BodyText (bodyData: BodyDataProps): ReactElement {
    return (
        <Typography
            variant="body2"
            color = "text.secondary"
            sx = {{
                overflow: 'auto',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                width: '100%',
                height: '100%',
                flexGrow: 50,
                WebkitLineClamp: 25,
            }}
        >
            {bodyData.content}
        </Typography>
    );
};
