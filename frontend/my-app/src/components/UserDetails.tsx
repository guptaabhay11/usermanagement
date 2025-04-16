import React from 'react';
import {
  Paper, Typography, CircularProgress, Alert, Chip, Box, Divider,
  Stack, Button, Snackbar, Alert as MuiAlert
} from '@mui/material';
import {
  useGetUserByIdQuery,
  useResendEmailMutation,
  useUpdateKYCStatusMutation
} from '../services/api';
import KycReviewDialog from './KycReviewDialog';

interface UserDetailsProps {
  userId: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const { data, isLoading, error, refetch } = useGetUserByIdQuery(userId);
  const [resendEmail, { isLoading: isSending, isSuccess: sent, isError: sendError }] = useResendEmailMutation();
  const [updateKycStatus, { isLoading: isUpdating }] = useUpdateKYCStatusMutation();
  const [isKycModalOpen, setKycModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const user = data?.data;

  const showToast = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleResendKyc = async () => {
    if (!user) {
      showToast('User not found.', 'error');
      return;
    }
    try {
      await resendEmail({ email: user.email }).unwrap();
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
  };

  const handleApprove = async () => {
    if (!user) {
      showToast('User not found.', 'error');
      return;
    }
    try {
      const result = await updateKycStatus({
        userId: user._id,
        body: {
          kyc: {
            completed: true,
            status: 'verified'
          }
        }
      }).unwrap();

      console.log('KYC Approved:', result);
      await refetch();
      setKycModalOpen(false);
      showToast('User KYC approved.', 'success');
    } catch (err) {
      console.error('Failed to approve KYC:', err);
      showToast('Failed to approve KYC.', 'error');
    }
  };

  const handleReject = async () => {
    if (!user) {
      showToast('User not found.', 'error');
      return;
    }
    try {
      const result = await updateKycStatus({
        userId: user._id,
        body: {
          kyc: {
            completed: false,
            status: 'rejected'
          }
        }
      }).unwrap();

      console.log('KYC Rejected:', result);
      await refetch();
      setKycModalOpen(false);
      showToast('User KYC rejected.', 'success');
    } catch (err) {
      console.error('Failed to reject KYC:', err);
      showToast('Failed to reject KYC.', 'error');
    }
  };

  if (isLoading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>Error loading user details</Alert>;
  if (!user) return <Alert severity="warning" sx={{ my: 2 }}>User not found</Alert>;

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography variant="h4" gutterBottom>User Details</Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* User Info */}
          <Box flex={1}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box><Typography>ID</Typography><Typography>{user._id}</Typography></Box>
                <Box><Typography>Name</Typography><Typography>{user.name}</Typography></Box>
                <Box><Typography>Email</Typography><Typography>{user.email}</Typography></Box>
                <Box><Typography>Role</Typography><Chip label={user.role} size="small" /></Box>
              </Stack>
            </Paper>
          </Box>

          {/* KYC Status */}
          <Box flex={1}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">Account Status</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box><Typography>Active</Typography><Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} size="small" /></Box>
                <Box><Typography>Blocked</Typography><Chip label={!user.isBlocked ? 'Not Blocked' : 'Blocked'} color={!user.isBlocked ? 'success' : 'error'} size="small" /></Box>
                <Box><Typography>Verified</Typography><Chip label={user.isVerified ? 'Verified' : 'Not Verified'} color={user.isVerified ? 'success' : 'error'} size="small" /></Box>
                <Box>
                  <Typography>KYC Completed</Typography>
                  <Chip label={user.kyc?.completed ? 'Completed' : 'Not Completed'} color={user.kyc?.completed ? 'success' : 'error'} size="small" />
                  {!user.kyc?.completed && (
                    <Box mt={1}>
                      <Button variant="outlined" size="small" onClick={handleResendKyc} disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send KYC Reminder'}
                      </Button>
                      {sent && <Typography variant="caption" color="success.main">Reminder sent!</Typography>}
                      {sendError && <Typography variant="caption" color="error.main">Failed to send reminder.</Typography>}
                    </Box>
                  )}
                </Box>

                {/* KYC Images + Review + Actions */}
                {user.kyc?.images?.length > 0 && (
                  <Box mt={2}>
                    <Button variant="contained" size="small" onClick={() => setKycModalOpen(true)}>
                      Review KYC
                    </Button>

                    {!user.kyc?.completed && (
                      <Box mt={2} display="flex" gap={2}>
                        <Button 
                          onClick={handleReject} 
                          color="error" 
                          variant="contained" 
                          disabled={isUpdating}>
                          {isUpdating ? <CircularProgress size={18} /> : 'Reject'}
                        </Button>
                        <Button 
                          onClick={handleApprove} 
                          color="success" 
                          variant="contained" 
                          disabled={isUpdating}>
                          {isUpdating ? <CircularProgress size={18} /> : 'Approve'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Timestamps */}
        <Box mt={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6">Timestamps</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
              <Box>
                <Typography>Created At</Typography>
                <Typography>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography>Updated At</Typography>
                <Typography>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Paper>

      {/* KYC Dialog (clean version, no buttons) */}
      <KycReviewDialog
        open={isKycModalOpen}
        onClose={() => setKycModalOpen(false)}
        images={user.kyc?.images?.map(img => ({
          url: img.url,
          uploadedAt: typeof img.uploadedAt === 'string' ? img.uploadedAt : new Date(img.uploadedAt).toISOString()
        }))}
        isUpdating={isUpdating}
        kycStatus={user.kyc?.status || 'pending'}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default UserDetails;
