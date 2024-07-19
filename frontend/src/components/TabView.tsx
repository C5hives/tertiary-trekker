import React, { useState, useEffect, ReactElement } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ResultList from './searchResult/ResultList';
import SearchResult from '../types/SearchResult';
import '../styles/TabView.css';

interface TabViewProps {
  searchResults: SearchResult[];
}

export default function TabView({ searchResults }: TabViewProps): ReactElement {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryResults, setCategoryResults] = useState<{ [key: string]: SearchResult[] }>({});

    useEffect(() => {
        // group search results by category
        const resultsByCategory: { [key: string]: SearchResult[] } = {}; // keys will be added dynamically
        searchResults.forEach(result => {
            if (!resultsByCategory[result.category]) {
                // add new key if it doesn't exist
                resultsByCategory[result.category] = [];
            }
            // push the relevant SearchResult type into the corresponding key
            resultsByCategory[result.category].push(result);
        });

        setCategories(Object.keys(resultsByCategory).sort());
        setCategoryResults(resultsByCategory);
    }, [searchResults]);

    const handleChange = (event: React.SyntheticEvent, newIndex: number) => {
        setCurrentIndex(newIndex);
    };

  return (
    <Box className = 'results' sx = {{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        width: '100%',
        margin: 'auto',
        padding: '8px',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowX: 'auto'
    }}>
        <Box sx = {{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value = {currentIndex} onChange = {handleChange} aria-label = "category tabs">
                {/* create tabs based on number of categories */}
                {categories.map((category, index) => (
                    <Tab label = {category} key={index} />
                ))}
            </Tabs>
        </Box>
        {categories.map((category, index) => (
            // populate the result list with items in their respective categories
            <Box
                role = "tabpanel"
                hidden = {currentIndex !== index} // only show element if on the correct tab
                id = {`tabpanel-${index}`}
                aria-labelledby = {`tab-${index}`}
                key = {index}
                sx = {{ padding: 1, flexGrow: 1, overflowY: 'auto' }}
            >
                {currentIndex === index && <ResultList results = {categoryResults[category]} />}
            </Box>
        ))}
    </Box>
  );
};
