import './App.css';
import mainTheme from './themes/MainTheme';
import  { useState } from 'react';
import ResultList from './components/searchResult/ResultList';
import SearchResult from './types/SearchResult';
import SearchBar from './components/SearchBar';
import Header from './components/Header';
import { ThemeProvider } from '@emotion/react';
import TabView from './components/TabView';
import DetailsButton from './components/searchResult/DetailsButton';


const mockResults: SearchResult[] = [
  {
    id: '1',
    url: 'https://example.com/1',
    category: 'ntu',
    title: 'Example Title 1 long long long long long long long long long long long long long long long long long long long long long ',
    content: 'Example content 1... long longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong',
  },
  {
    id: '2',
    url: 'https://example.com/2',
    category: 'nus',
    title: 'Example Title 2',
    content: 'Example content 2...',
  },
  {
    id: '3',
    url: 'https://example.com/3',
    category: 'nus',
    title: 'Example Title 2',
    content: 'Example content 2...',
  },
  {
    id: '4',
    url: 'https://example.com/4',
    category: 'nus',
    title: 'Example Title 2',
    content: 'Example content 2...',
  },
  {
    id: '5',
    url: 'https://example.com/5',
    category: 'nus',
    title: 'Example Title 2',
    content: 'Example content 2...',
  },
  {
    id: '6',
    url: 'https://example.com/6',
    category: 'nus',
    title: 'Example Title 2',
    content: 'Example content 2...',
  },
  // Add more mock results as needed
];

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = (query: string) => {
    console.log(`Searching for: ${query}`);
    // Simulate an API call
    setTimeout(() => {
      setSearchResults(mockResults); // Replace with actual API call results
    }, 1000);
  };

  return (
    <ThemeProvider theme={mainTheme}>
      <div className = "app">
        <Header></Header>
        <div>
          <SearchBar onSearch = {handleSearch} />
          <h1>Displaying Results</h1>
          <TabView searchResults = {searchResults} />
        </div>
      </div>
    </ThemeProvider>
    
  );
}

export default App;
