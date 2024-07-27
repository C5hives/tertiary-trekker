import { ReactElement } from 'react';
import { Typography } from '@mui/material';

interface BodyTextProps {
    content: string
};

export default function BodyText (bodyData: BodyTextProps): ReactElement {
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
