import './App.css';
import  { useState } from 'react';
import SearchResult from './types/SearchResult';
import SearchBar from './components/mainPage/SearchBar';
import Header from './components/mainPage/Header';
import { ThemeProvider } from '@emotion/react';
import TabView from './components/mainPage/TabView';
import { searchForDocumentWithText } from './search/search';
import Sidebar from './components/mainPage/sidebar/Sidebar';
import { Box, createTheme } from '@mui/material';

function App() {
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set<string>());
  const [documents, setDocuments] = useState<Map<string, SearchResult[]>>(new Map());
  
  const handleSearch = (query: string) => {
    setTimeout(() => {
      setDocuments(searchForDocumentWithText(query)); // Replace with actual API call results
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
        <div>
          <SearchBar onSearch = {handleSearch} />
          <h1>Displaying Results</h1>
          <Box sx = {{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          }}>
            <Sidebar
              categories = {Array.from(documents.keys()).sort()}
              visibleCategories = {visibleCategories}
              handleFilterChange = {handleFilterChange}/>
            <TabView visibleCategories = {visibleCategories} documents = {documents} />
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
