import { ReactElement, useState } from "react";
import { Box, Button, Divider, Drawer, IconButton, Typography } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import Filter from "./Filter";
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  //...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface InfoPanelProps {
    categories: string[]
    visibleCategories: Set<string>
    handleFilterChange: (category: string, checked: boolean) => void
  }

export default function InfoPanel({categories , visibleCategories, handleFilterChange}: InfoPanelProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CssBaseline />
        <Button onClick = {handleDrawerOpen}>
            <FilterListIcon /> Open Filters
        </Button>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant = "persistent"
        anchor = "left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Typography variant = 'h6' sx = {{ padding: 1, paddingLeft: 2 }}>Filter Options</Typography>
        <Divider />
        <Filter
            categories = {categories}
            visibleCategories = {visibleCategories}
            handleFilterChange = {handleFilterChange} />
      </Drawer>
    </Box>
  );
}