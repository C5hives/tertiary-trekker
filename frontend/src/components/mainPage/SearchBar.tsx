import React, { ReactElement, useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar ({ onSearch }: { onSearch: (query: string) => void }): ReactElement {
  const [query, setQuery] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
        <Box component="img" src='logo.png' alt="Logo" sx={{ height: 100, mr: 1, borderRadius: 3 }} />
        <TextField
            value = {query}
            onChange = {handleInputChange}
            onKeyUp = {handleKeyPress}
            placeholder = "Search..."
            variant = "outlined"
            fullWidth
            sx = {{ mr: 1 }}
        />
        <Button
            variant = "contained"
            color = "primary"
            onClick = {handleSearch}
            startIcon = {<SearchIcon />}
        >
            Search
        </Button>
    </Box>
  );
};
