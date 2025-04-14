import { useState } from 'react';
import { RootState } from '../store/store'; // Adjust the path to your store file
import { useSelector } from 'react-redux';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useUpdateUserMutation } from '../services/api';


interface DashboardSection {
  title: string;
  description: string;
  completed: boolean;
  field: 'kycCompleted' | 'isActive';
}

const UserDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [localUser, setLocalUser] = useState(user);

  const handleToggle = async (field: string, value: boolean) => {
    if (!user?._id) {
      toast.error('User ID is missing!');
      return;
    }
    console.log('Updating field:', field, 'to value:', value);
  
    try {
      const updatedUser = await updateUser({
        userId: user._id,
        [field]: value,
      }).unwrap();
  
      setLocalUser({
        ...updatedUser.data,
        createdAt: updatedUser.data.createdAt?.toString() || '',
      });
  
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };
  
  const sections: DashboardSection[] = [
    {
      title: "Finish KYC Verification",
      description: "Just a quick identity check 👍",
      completed: localUser?.kycCompleted || false,
      field: 'kycCompleted'
    },
    {
      title: "Account Status",
      description: "Activate/Deactivate your account",
      completed: localUser?.isActive || false,
      field: 'isActive'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {localUser?.name || 'User Dashboard'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {localUser?.email}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Management
            </Typography>

            {sections.map((section) => (
              <Box
                key={section.field}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="subtitle1">{section.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.description}
                    </Typography>
                  </div>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={section.completed}
                        onChange={(e) => handleToggle(section.field, e.target.checked)}
                        disabled={isLoading}
                      />
                    }
                    label={section.completed ? "Completed" : "Pending"}
                    labelPlacement="start"
                  />
                </Box>
              </Box>
            ))}

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Account Verified: {localUser?.isVerified ? '✅ Verified' : '⏳ Pending'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Member Since: {localUser?.createdAt ? new Date(localUser.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Your progress is always saved with love! 💖
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserDashboard;