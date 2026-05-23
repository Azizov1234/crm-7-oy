import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'Asosiy', icon: <DashboardIcon />, path: '/dashboard' },
  { text: "O'qituvchilar", icon: <PeopleIcon />, path: '/teachers', premium: true },
  { text: 'Guruhlar', icon: <GroupsIcon />, path: '/groups' },
  { text: 'Talabalar', icon: <SchoolIcon />, path: '/students', premium: true },
  { text: 'Boshqarish', icon: <SettingsIcon />, path: '/management' },
];

export default function Sidebar({ openSettings, setOpenSettings, isSidebarCollapsed, setIsSidebarCollapsed, isManagementMenuOpen, setIsManagementMenuOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = isMobile ? false : isSidebarCollapsed;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Mobil Drawer yopish uchun yordamchi funksiya
  const closeMobileIfNeeded = () => {
    if (onMobileClose) onMobileClose();
  };

  const activeStyles = {
    backgroundColor: '#334155',
    color: '#fff',
    borderRadius: '12px',
    '&:hover': { backgroundColor: '#1f2937' },
    '& .MuiListItemIcon-root': { color: '#fff' }
  };

  const defaultStyles = {
    borderRadius: '12px',
    marginBottom: '4px',
    color: '#6b7280',
    '&:hover': { backgroundColor: '#f9fafb', color: '#111827' },
    '& .MuiListItemIcon-root': { color: '#6b7280' }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexShrink: 0, position: 'relative', zIndex: 1300 }}>
      <Box sx={{ position: 'relative', height: '100%' }}>
        <IconButton
          size="small"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          sx={{
            display: { xs: 'none', md: 'flex' },
            backgroundColor: '#334155',
            color: 'white',
            borderRadius: 1,
            width: 24,
            height: 24,
            '&:hover': { backgroundColor: '#1f2937' },
            position: 'absolute',
            right: -12,
            top: 32,
            zIndex: 1500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 12, transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </IconButton>

        <Box
          sx={{
            width: { xs: 260, md: collapsed ? 80 : 260 },
            flexShrink: 0,
            height: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '0 30px 30px 0',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Logo Area */}
          <Box sx={{ p: 2.5, pb: 3, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <Box
              component="img"
              src="/najot-logo.svg"
              alt="Najot Ta'lim"
              sx={{
                width: collapsed ? 34 : 170,
                height: collapsed ? 34 : 40,
                objectFit: collapsed ? 'cover' : 'contain',
                objectPosition: 'left center',
                borderRadius: 1,
              }}
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </Box>

          {/* Main Menu */}
          <List sx={{ px: collapsed ? 1 : 2, flex: 1, overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/management' && location.pathname.startsWith('/management'));
              
              const handleClick = (e) => {
                if (item.text === 'Boshqarish') {
                  e.preventDefault();
                  setIsManagementMenuOpen(!isManagementMenuOpen);
                }
                // Mobil Drawer yopilsin
                closeMobileIfNeeded();
              };
 
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={handleClick}
                    sx={{
                      ... (isActive ? activeStyles : defaultStyles),
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 0 : 2,
                      minHeight: 52,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center', color: isActive ? '#fff' : '#111827' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#fff' : '#111827' }}>{item.text}</Typography>
                        {item.premium && <WorkspacePremiumIcon sx={{ fontSize: 16, color: '#fbbf24' }} />}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Subscription Box */}
          {!collapsed && (
            <Box sx={{ p: 2, mb: 2, mx: 1.5, backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, backgroundColor: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 22, color: '#334155' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>Subscription</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.2 }}>You can renew your premium subscription.</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', backgroundColor: '#475569', borderRadius: 3 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 500 }}>1y 4m 12h</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f3f4f6' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                  <BoltIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Upgrade now</Typography>
                </Box>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  <OpenInNewIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Logout Button */}
          <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid #f3f4f6' }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  ...defaultStyles,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 0 : 2,
                  minHeight: 52,
                  color: '#ef4444',
                  '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' },
                  '& .MuiListItemIcon-root': { color: '#ef4444' }
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center' }}>
                  <LogoutIcon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {!collapsed && (
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Chiqish</Typography>
                )}
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
