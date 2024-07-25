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
    <Box sx={{
      display: 'flex',
      boxSizing: 'border-box',
      flexDirection: 'row',
      alignItems: 'center',
      margin: 1,
      gap: '9px',
      width: '100%',
      alignContent: 'space-between'
    }}>
        <Box component = "img" src = 'logo.png' alt = "Logo" sx={{ height: 100, borderRadius: 3, boxSizing: 'border-box', flexShrink: 0 }} />
        <TextField
            value = {query}
            onChange = {handleInputChange}
            onKeyUp = {handleKeyPress}
            placeholder = "Search..."
            variant = "outlined"
            fullWidth
            sx={{ flexGrow: 2 }}
        />
        <Button
            variant = "contained"
            color = "primary"
            onClick = {handleSearch}
            startIcon = {<SearchIcon />}
            sx={{ flexShrink: 0 }}
        >
            Search
        </Button>
    </Box>
  );
};
