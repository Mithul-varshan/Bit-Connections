import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar } from '@mui/material';
import logo from '../../assets/logo-removebg-preview.png';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import IntegratedSpeedDial from '../speeddial/Speed_Dial';
import MiddleManRecords from '../../pages/midddlemanHome/MiddleManHome';
import useAuthStore from '../../store/authStore';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const bottomItem = { text: 'Logout', icon: <LogoutIcon /> };
  const [open, setOpen] = React.useState(false);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout); 
  //console.log(user);
  // DYNAMIC MENUITEMS 
  const getMenuItems = () => {
    if (!user) return []; // Safety check
    switch(user.role) {
      case 'user':
        return [{ text: "Home", icon: <HomeIcon />, path: '/user' }];
      case 'middleman':
        return [
          { text: "Home", icon: <HomeIcon />, path: '/middleman' },
          { text: "Pending Records", icon: <PendingActionsIcon />,path: '/middleman/pending-records'  }
        ];
      case 'admin':
        return [{ text: "Admin Panel", icon: <AdminPanelSettingsIcon />, path: '/admin' }];
      default:
        return [];
    }
  };
  const menuItems = getMenuItems();
  const handleLogout = () => {
    logout();
    navigate('/login', {replace: true});
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar sx={{ backgroundColor: '#2f3542', }} position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            {/* <img src={logo} width={400} alt="Logo" /> */}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mx: 3 }}>
            <Avatar sx={{ mx: 2, backgroundColor: '#008CBA' }}>
                {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant='h6'>{user?.email}</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open} sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: '#dbdbdbff',
          borderRight: '1px solid #bfbfbfff'
        }
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}>
          <Box>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            {/* --- 7. CORRECTLY MAP AND NAVIGATE WITH THE DYNAMIC ITEMS --- */}
            <List>
              {menuItems.map(({ text, path, icon }) => (
                <React.Fragment key={text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      // This part handles the navigation. Use NavLink for better integration with React Router.
                      component={NavLink}
                      to={path}
                      selected={location.pathname === path}
                      sx={{
                        minHeight: 48, px: 2.5, borderRadius: 0.9, mx: 0.7,
                        justifyContent: open ? 'initial' : 'center',
                        '&.Mui-selected': { backgroundColor: '#e9f3fd', color: '#0d47a1', '& .MuiListItemIcon-root': { color: '#0d47a1' }, '&:hover': { backgroundColor: '#e9f3fd' } },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', mr: open ? 3 : 'auto' }}>
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </ListItem>
                  <Divider variant="middle" sx={{ my: .1 }} component="li" />
                </React.Fragment>
              ))}
            </List>

          </Box>
          <List>
            <Divider />
            <ListItem disablePadding>
              {/* --- 8. WIRE UP THE LOGOUT ONCLICK EVENT --- */}
              <ListItemButton sx={{ minHeight: 48, px: 2.5, justifyContent: open ? 'initial' : 'center' }} onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', mr: open ? 3 : 'auto' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
