import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  CircularProgress,
  Typography,
  Button,
  Dialog,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useLogoutMutation } from '../services/api';
import UserList from './UserList';
import UserDetails from './UserDetails';
import InviteUser from './InviteUser';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);

  const { data: usersData, isLoading, error } = useGetAllUsersQuery();
  const [logout] = useLogoutMutation();
  const { isAuthenticated, loading, user: currentUser } = useSelector((state: RootState) => state.auth);

useEffect(() => {
  if (loading) return; // Don't redirect until hydration is complete

  if (!isAuthenticated) {
    navigate('/login');
  } else if (currentUser && currentUser.role !== 'ADMIN') {
    navigate('/unauthorized');
  }
}, [isAuthenticated, currentUser, loading, navigate]);


  // Close UserDetails when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedUserId &&
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setSelectedUserId(null);
      }
    };

    if (selectedUserId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedUserId]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Error loading dashboard data</Typography>
      </Box>
    );
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Unauthorized access</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Typography variant="subtitle1" sx={{ fontStyle: 'italic' }}>
            Welcome, {currentUser.name} ({currentUser.role})
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenInviteDialog(true)}
          >
            Create User
          </Button>

          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Content */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, mt: 2, pb: 4 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={3}
        >
          {/* User List */}
          <Box
            sx={{
              flex: selectedUserId ? 1.5 : 1,
              transition: 'flex 0.3s ease',
            }}
          >
            <UserList onUserSelect={setSelectedUserId} />
          </Box>

          {/* User Details */}
          {selectedUserId && (
            <Box
              ref={detailsRef}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: '400px' },
                maxWidth: { md: '500px' },
                transition: 'opacity 0.3s ease',
              }}
            >
              <UserDetails userId={selectedUserId} />
            </Box>
          )}
        </Box>
      </Container>

      {/* Invite User Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
        <InviteUser onClose={() => setOpenInviteDialog(false)} />
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
