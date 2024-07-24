import { ReactElement, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Filter from './Filter';

interface SidebarProps {
  categories: string[]
  visibleCategories: Set<string>
  handleFilterChange: (category: string, checked: boolean) => void
}

export default function Sidebar({categories , visibleCategories, handleFilterChange}: SidebarProps): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box
      sx={{
        width: isOpen ? 200 : 50,
        transition: 'width 0.3s',
        overflow: 'hidden',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          height: '100%'
        }}
      >
        { isOpen && <Typography
          variant="h6"
          sx = {{
            paddingLeft: 2,
            flexGrow: 10
          }}>Filter Options</Typography>}
        <IconButton
          onClick = {toggleSidebar}
          sx = {{
            alignSelf: isOpen ? 'flex-end' : 'center',
            marginTop: 1,
          }}
        >
          {isOpen ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
        </IconButton>
      </Box>
      
      {isOpen && (
        <Box sx={{ padding: 2 }}>
          <Filter categories = {categories} visibleCategories = {visibleCategories} handleFilterChange = {handleFilterChange} />
        </Box>
      )}
    </Box>
  );
}