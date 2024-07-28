import React, { ReactElement, useState } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
}

export default function SearchBar ({ onSearch, loading }: SearchBarProps): ReactElement {
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

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <Box
      sx = {{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'flex-start',
        padding: 1,
        boxSizing: 'border-box',
        gap: '9px',
        width: '100%',
      }}
    >
      <Box
        component="img"
        src="logo.png"
        alt="Logo"
        sx = {{ height: 100, borderRadius: 3, boxSizing: 'border-box', cursor: 'pointer' }}
        onClick={handleLogoClick}
      />
      <TextField
        value={query}
        onChange={handleInputChange}
        onKeyUp={handleKeyPress}
        placeholder="Search..."
        variant="outlined"
        sx = {{ flexGrow: 1 }}
      />
      <Button
        variant = "contained"
        color = "primary"
        onClick = {handleSearch}
        startIcon = {
          loading ? (
            <CircularProgress color = "inherit" size = {20} />
          ) : (
            <SearchIcon />
          )
        }
        disabled = {loading}
        sx = {{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          width: '8%',
          "& .MuiButton-startIcon": {
            margin: "0px"
          },
        }}
      >
        {loading ? '' : 'Search'}
      </Button>
    </Box>
  );
};
