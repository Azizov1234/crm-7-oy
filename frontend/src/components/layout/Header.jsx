import { Box, InputBase, IconButton, Avatar, Select, MenuItem, Badge, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header({ onMenuToggle }) {
  return (
    <Box
      sx={{
        height: { xs: 64, sm: 90 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: { xs: '0 12px', sm: '0 25px' },
        position: 'relative',
        zIndex: 1000,
        backgroundColor: 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{
            display: { xs: 'flex', md: 'none' },
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            p: 1,
          }}
        >
          <MenuIcon sx={{ fontSize: 20, color: '#475569' }} />
        </IconButton>

        <IconButton
          sx={{
            display: { xs: 'none', sm: 'flex' },
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            p: 1.2,
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 18, color: '#475569' }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
            sx={{
              backgroundColor: '#334155',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              padding: { xs: '6px 14px', sm: '8px 24px' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              '&:hover': { backgroundColor: '#1f2937' },
              boxShadow: '0 4px 10px rgba(51, 65, 85, 0.22)',
            }}
          >
            Qo'shish
          </Button>

          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '8px 16px',
              width: { sm: '180px', md: '250px' },
              border: '1px solid #e2e8f0',
              '&:focus-within': {
                borderColor: '#334155',
                backgroundColor: '#fff',
                boxShadow: '0 0 0 4px rgba(51, 65, 85, 0.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 22, mr: 1.5 }} />
            <InputBase
              placeholder="Qidirish..."
              sx={{
                flex: 1,
                fontSize: '0.95rem',
                fontWeight: 500,
                '& input::placeholder': { color: '#94a3b8', opacity: 1 },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
        <Select
          value="uz"
          size="small"
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            boxShadow: 'none',
            '.MuiOutlinedInput-notchedOutline': { border: 0 },
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
        >
          <MenuItem value="uz">O'zbekcha</MenuItem>
          <MenuItem value="ru">Ruscha</MenuItem>
        </Select>

        <IconButton sx={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <Badge badgeContent={1} color="error">
            <NotificationsNoneIcon sx={{ color: '#475569', fontSize: 20 }} />
          </Badge>
        </IconButton>

        <IconButton
          sx={{
            display: { xs: 'none', sm: 'flex' },
            backgroundColor: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            '&:hover': { backgroundColor: '#111827' },
          }}
        >
          <DarkModeIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Avatar sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, ml: 0.5, bgcolor: '#fca5a5' }} src="/avatar.jpg">
          A
        </Avatar>
      </Box>
    </Box>
  );
}
