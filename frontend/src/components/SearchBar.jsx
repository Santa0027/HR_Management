// frontend/src/components/common/SearchBar.jsx
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = ({ onSearch, placeholder = "Search...", initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(query);
  };

  const handleClearClick = () => {
    setQuery("");
    onSearch(""); // Trigger search with empty query to clear results
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 300, my: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleSearchClick} edge="start">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: query && ( // Show clear icon only if there's text
            <InputAdornment position="end">
              <IconButton onClick={handleClearClick} edge="end" size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;