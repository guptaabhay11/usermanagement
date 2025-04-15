import React from 'react';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Box,
  Divider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  useGetUserByIdQuery,
  useResendEmailMutation,
  useUpdateKYCStatusMutation
} from '../services/api';

interface UserDetailsProps {
  userId: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const { data, isLoading, error } = useGetUserByIdQuery(userId);
  const [resendEmail, { isLoading: isSending, isSuccess: sent, isError: sendError }] = useResendEmailMutation();
  const [updateKycStatus, { isLoading: isUpdating }] = useUpdateKYCStatusMutation();
  const [isKycModalOpen, setKycModalOpen] = React.useState(false);

  if (isLoading) return (
    <Box display="flex" justifyContent="center" my={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ my: 2 }}>
      Error loading user details
    </Alert>
  );

  const user = data?.data;

  if (!user) return (
    <Alert severity="warning" sx={{ my: 2 }}>
      User not found
    </Alert>
  );

  const getStatusChip = (status: boolean, positiveLabel: string, negativeLabel: string) => {
    return (
      <Chip
        label={status ? positiveLabel : negativeLabel}
        color={status ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const getRoleChip = (role: string) => {
    const colorMap: Record<string, 'primary' | 'secondary' | 'default' | 'info'> = {
      ADMIN: 'primary',
      USER: 'secondary',
      EDITOR: 'info'
    };
    return <Chip label={role} color={colorMap[role] || 'default'} size="small" />;
  };

  const handleResendKyc = async () => {
    try {
      await resendEmail({ email: user.email }).unwrap();
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
  };

  const handleApprove = async () => {
    if (!user?._id) return;
    await updateKycStatus({ userId: user._id, kycStatus: 'verified' });
    setKycModalOpen(false);
  };

  const handleReject = async () => {
    if (!user?._id) return;
    await updateKycStatus({ userId: user._id, kycStatus: 'rejected' });
    setKycModalOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        User Details
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Basic Information Section */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                <Typography>{user._id}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography>{user.name}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{user.email}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                {getRoleChip(user.role)}
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Account Status Section */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Active</Typography>
                {getStatusChip(user.isActive, 'Active', 'Inactive')}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Blocked</Typography>
                {getStatusChip(!user.isBlocked, 'Not Blocked', 'Blocked')}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Verified</Typography>
                {getStatusChip(user.isVerified, 'Verified', 'Not Verified')}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">KYC Completed</Typography>
                {getStatusChip(user.kyc.completed, 'Completed', 'Not Completed')}

                {!user.kyc.completed && (
                  <Box mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleResendKyc}
                      disabled={isSending}
                    >
                      {isSending ? 'Sending...' : 'Send KYC Reminder'}
                    </Button>

                    {sent && (
                      <Typography variant="caption" color="success.main" display="block" mt={1}>
                        Reminder sent!
                      </Typography>
                    )}
                    {sendError && (
                      <Typography variant="caption" color="error.main" display="block" mt={1}>
                        Failed to send reminder.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Review KYC Button */}
              {user.kyc?.images?.length > 0 && (
                <Box>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => setKycModalOpen(true)}
                  >
                    Review KYC
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* Timestamps Section */}
      <Box sx={{ mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Timestamps
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography>
                {new Date(user.createdAt || '').toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
              <Typography>
                {new Date(user.updatedAt || '').toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* KYC Review Dialog */}
      <Dialog open={isKycModalOpen} onClose={() => setKycModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review KYC Documents</DialogTitle>
        <DialogContent dividers>
          {user.kyc.images?.length > 0 ? (
            <ImageList cols={3} gap={12}>
              {user.kyc.images.map((img: any, index: number) => (
                <ImageListItem key={index}>
                  <img
                    src={img.url}
                    alt={`KYC ${index + 1}`}
                    loading="lazy"
                    style={{ borderRadius: 8, width: '100%' }}
                  />
                  <Typography variant="caption" display="block" align="center" mt={1}>
                    Uploaded: {new Date(img.uploadedAt).toLocaleDateString()}
                  </Typography>
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Typography>No KYC images uploaded.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReject} color="error" disabled={isUpdating}>
            {isUpdating ? 'Processing...' : 'Reject'}
          </Button>
          <Button onClick={handleApprove} color="success" disabled={isUpdating}>
            {isUpdating ? 'Processing...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserDetails;
