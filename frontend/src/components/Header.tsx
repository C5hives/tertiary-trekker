import { Box, Typography, Stack, Link } from '@mui/material';
import '../styles/Header.css';

export default function Header() {
    return (
        <header className="header">
            <Box sx={{ display: 'inline-block', width: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" height="50%">
                    <Box sx={{ width: '50%', textAlign: 'left', margin: 1 }}>
                        <Typography variant="h6">Orbital 2024</Typography>
                    </Box>
                    <Box sx={{ width: '50%', textAlign: 'right', margin: 1 }}>
                        <Typography variant="h6">
                            <Link href='https://github.com/C5hives/tertiary-trekker/'
                                variant="inherit"
                                target="_blank"
                                rel="noopener"
                                underline="hover"
                                color="inherit"
                            >
                                Github
                            </Link>
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </header>
    );
}