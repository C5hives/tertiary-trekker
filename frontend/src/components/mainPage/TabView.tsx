import React, { useState, useEffect, ReactElement, useMemo } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import List from '../result/List';
import SearchResult from '../../types/SearchResult';

interface TabViewProps {
  visibleCategories: Set<string>
  documents: Map<string, SearchResult[]>
}

export default function TabView({ visibleCategories, documents }: TabViewProps): ReactElement {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const categories: string[] = useMemo(() => Array.from(visibleCategories.values()).sort(), [visibleCategories]);
    const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
        setCurrentIndex(newIndex);
    };

    if (documents.size < 1 || visibleCategories.size < 1) {
        return (
            <Box sx = {{
                flexGrow: 10,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                textAlign: 'center',
            }}>
                <Typography>No results to display. Search for something!</Typography>
            </Box>
          );
    }

    return (
        <Box sx = {{
            backgroundColor: '#FBFCFE',
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
                <Tabs value = {currentIndex} onChange = {handleTabChange} aria-label = "category tabs">
                    {
                        categories.map((category: string, index: number) => (<Tab label = {category} key = {index}/>))
                    }
                </Tabs>
            </Box>
            {
                categories.map((category: string, index: number) => (
                    // populate the result list with items in their respective categories
                    <Box
                        role = "tabpanel"
                        hidden = {currentIndex !== index} // only show element if on the correct tab
                        id = {`tabpanel-${index}`}
                        aria-labelledby = {`tab-${index}`}
                        key = {index}
                        sx = {{ padding: 1, flexGrow: 1, overflowY: 'auto' }}
                    >
                        {
                            currentIndex === index && <List results = {documents.get(category)!} />
                        }
                    </Box>
                ))
            }
        </Box>
    );
};
