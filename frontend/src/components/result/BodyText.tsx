import { ReactElement } from 'react';
import { Typography } from '@mui/material';

interface BodyTextProps {
    content: string
}

export default function BodyText (bodyData: BodyTextProps): ReactElement {
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
