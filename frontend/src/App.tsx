import './App.css';
import  { Fragment, useEffect, useState } from 'react';
import SearchResult from './types/SearchResult';
import SearchBar from './components/mainPage/SearchBar';
import Header from './components/mainPage/Header';
import { ThemeProvider } from '@emotion/react';
import TabView from './components/mainPage/TabView';
import { searchForDocumentWithText } from './search/search';
import { Alert, Box, createTheme, IconButton, Snackbar } from '@mui/material';
import Drawer from './components/mainPage/filter/Drawer';
import Response from './types/Response';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set<string>());
  const [documents, setDocuments] = useState<Map<string, SearchResult[]>>(new Map());
  const [response, setResponse] = useState<Response>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (response == null) {
      return;
    }

    if(response.code < 200 || response.code > 299) {
      setOpen(true);
    }
  }, [response]);

  const evaluateSeverity = (code: number | undefined): "success" | "warning" | "error" | "info" | undefined => {
    if (code == null) {
      return undefined;
    }

    if (code >= 200 && code <= 299) {
        return 'success';
    } else if (code >= 400 && code <= 599) {
        return 'warning';
    } else {
        return 'error';
    }
  }

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <Fragment>
      <IconButton
        size = "small"
        aria-label = "close"
        color = "inherit"
        onClick = {handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );
  
  const handleSearch = (query: string) => {
    if (query.length < 1) {
      setResponse({code: 400, message: 'Search query cannot be empty!'});
      return;
    }

    console.log('searching...');
    setLoading(true);
    searchForDocumentWithText(query)
      .then(([response, documents] : [Response, Map<string, SearchResult[]>]) => {
        setDocuments(documents);
        setVisibleCategories(new Set(Array.from(documents.keys())));
        setResponse(response);
      })
      .catch(err => {
        console.log(`uh oh => ${err}`);
      })
      .finally(() => {
        setLoading(false);
      })
    
  };

  const handleFilterChange = (category: string, checked: boolean) => {
    setVisibleCategories(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(category);
      } else {
        newSet.delete(category);
      }
      return newSet;
    });
  };

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

  return (
    <ThemeProvider theme = { mainTheme }>
      <div className = "app">
        <Snackbar
          anchorOrigin = {{ vertical: 'top', horizontal: 'center' }}
          open = {open}
          autoHideDuration = {6000}
          onClose = {handleClose}
          action = {action}
        >
          <Alert
            onClose = {handleClose}
            severity = {evaluateSeverity(response?.code)}
            variant = "filled"
            sx={{ width: '100%' }}
          >
            {`${response?.message}`}
          </Alert>
        </Snackbar>
        <Header></Header>
        <Box sx = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '5px',
          boxSizing: 'border-box',
          wdith: '100%',
          flexGrow: 1,
        }}>
          <SearchBar onSearch = {handleSearch} loading = {loading} />
          <Drawer
            categories = {Array.from(documents.keys()).sort()}
            visibleCategories = {visibleCategories}
            handleFilterChange = {handleFilterChange}
          />
          <TabView
            visibleCategories = {visibleCategories}
            documents = {documents}
            setResponse = {setResponse}
          />
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
