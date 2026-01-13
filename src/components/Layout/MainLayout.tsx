// File: src/components/Layout/MainLayout.tsx

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import { useColorMode } from '../../theme/AppTheme';
// Importamos el selector para ponerlo en la barra superior
import ClientSelector from '../ClientSelector'; 

const DRAWER_WIDTH = 240;

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: number;
  onTabChange: (newValue: number) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const theme = useTheme();
  const colorMode = useColorMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Gestor de Clientes', icon: <PeopleIcon />, index: 0 },
    { text: 'Catálogo de Productos', icon: <CategoryIcon />, index: 1 },
    { text: 'Entrenador de IA', icon: <SchoolIcon />, index: 2 },
    { text: 'Agenda de Citas', icon: <CalendarMonthIcon />, index: 3 },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Nexus Admin
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeTab === item.index}
              onClick={() => {
                onTabChange(item.index);
                setMobileOpen(false); 
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
                borderRadius: '0 24px 24px 0', 
                mr: 2,
              }}
            >
              <ListItemIcon sx={{ color: activeTab === item.index ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Barra Superior (AppBar) */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Título de la página actual */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 0, mr: 3, display: { xs: 'none', md: 'block' } }}>
            {menuItems[activeTab].text}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />

          {/* Selector de Cliente en el Header */}
          <Box sx={{ mr: 2 }}>
             <ClientSelector />
          </Box>
          
          {/* Botón de Tema */}
          <Tooltip title={`Cambiar a modo ${theme.palette.mode === 'dark' ? 'claro' : 'oscuro'}`}>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid rgba(0,0,0,0.08)' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, 
        }}
      >
        {children}
      </Box>
    </Box>
  );
};