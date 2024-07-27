import './App.css';
import  { useState } from 'react';
import SearchResult from './types/SearchResult';
import SearchBar from './components/mainPage/SearchBar';
import Header from './components/mainPage/Header';
import { ThemeProvider } from '@emotion/react';
import TabView from './components/mainPage/TabView';
import { searchForDocumentWithText } from './search/search';
import { Box, createTheme } from '@mui/material';
import Drawer from './components/mainPage/filter/Drawer';

function App() {
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set<string>());
  const [documents, setDocuments] = useState<Map<string, SearchResult[]>>(new Map());
  
  const handleSearch = (query: string) => {
    setTimeout(() => {
      setDocuments(searchForDocumentWithText(query)); // Replace with actual API call results soon
      setVisibleCategories(new Set(Array.from(documents.keys())));
    }, 1000);
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
        <Header></Header>
        <Box sx = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '5px',
          boxSizing: 'border-box',
          wdith: '100%'
        }}>
          <SearchBar onSearch = {handleSearch} />
          <Drawer
            categories = {Array.from(documents.keys()).sort()}
            visibleCategories = {visibleCategories}
            handleFilterChange = {handleFilterChange}/>
          <TabView
            visibleCategories = {visibleCategories}
            documents = {documents} />
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
