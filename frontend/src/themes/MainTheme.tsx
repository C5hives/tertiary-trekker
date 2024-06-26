import { createTheme } from '@mui/material/styles';

const mainTheme = createTheme({
  palette: {
    primary: {
      main: '#213555',
    },
    secondary: {
      main: '#4F709C',
    },
    background: {
      default: '#F0F0F0',
    },
    contrastThreshold: 4.5,
  },
});

export default mainTheme;
