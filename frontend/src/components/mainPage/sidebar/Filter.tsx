// FilterComponent.tsx
import React, { ReactElement } from 'react';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

interface FilterProps {
  categories: string[]
  visibleCategories: Set<string>
  handleFilterChange: (category: string, checked: boolean) => void
}

export default function Filter({ categories, visibleCategories, handleFilterChange }: FilterProps): ReactElement {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(event.target.name, event.target.checked)
  };

  return (
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
  );
};
