// FilterComponent.tsx
import React, { ReactElement } from 'react';
import { FormControl, FormGroup, FormControlLabel, Checkbox, Box, Typography } from '@mui/material';

interface FilterProps {
  categories: string[]
  visibleCategories: Set<string>
  handleFilterChange: (category: string, checked: boolean) => void
}

export default function Filter({ categories, visibleCategories, handleFilterChange }: FilterProps): ReactElement {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(event.target.name, event.target.checked)
  };

  if (categories.length < 1) {
    return (
      <Typography variant = 'body1' sx = {{paddingLeft: 2}}>No Categories to Filter</Typography>
    );
  }

  return (
    <Box sx = {{
      padding: 1,
      paddingLeft: 2
    }}>
      <FormControl component = "fieldset">
      <FormGroup>
        {
          categories.map((category) => (
            <FormControlLabel
              key = {category}
              control = {
                <Checkbox
                  checked = {visibleCategories.size < 1 ? false : visibleCategories.has(category)}
                  onChange = {handleChange}
                  name = {category}
                />
              }
              label={category.toUpperCase()}
            />
          ))
        }
      </FormGroup>
    </FormControl>
    </Box>
    
  );
};
