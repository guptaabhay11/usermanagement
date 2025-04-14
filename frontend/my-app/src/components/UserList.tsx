import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  Chip,
  Box
} from '@mui/material';
import { useGetAllUsersQuery } from '../services/api';
import { User } from '../types';

interface UserListProps {
  onUserSelect: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const { data, isLoading, error } = useGetAllUsersQuery();

  if (isLoading) return (
    <Box display="flex" justifyContent="center" my={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Alert severity="error" sx={{ my: 2 }}>
      Error loading users
    </Alert>
  );

  const users = data?.data || [];

  const getStatusChip = (user: User) => {
    if (user.isBlocked) {
      return <Chip label="Blocked" color="error" size="small" />;
    }
    return user.isActive 
      ? <Chip label="Active" color="success" size="small" />
      : <Chip label="Inactive" color="default" size="small" />;
  };

  const getRoleChip = (role: string) => {
    const colorMap: Record<string, 'primary' | 'secondary' | 'default' | 'info'> = {
      ADMIN: 'primary',
      USER: 'secondary',
      EDITOR: 'info'
    };
    return <Chip label={role} color={colorMap[role] || 'default'} size="small" />;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Registered Users ({users.length})
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => (
              <TableRow 
                key={user._id} 
                onClick={() => onUserSelect(user._id)}
                hover
                sx={{ 
                  cursor: 'pointer',
                  opacity: user.isBlocked ? 0.7 : 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getStatusChip(user)}</TableCell>
                <TableCell>{getRoleChip(user.role)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UserList;