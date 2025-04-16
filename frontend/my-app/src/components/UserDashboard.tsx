import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useMeQuery, useUploadKycMutation } from '../services/api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ['Aadhar Card', 'PAN Card', 'Selfie'];

const UserDashboard = () => {
  const { data: userData, isLoading, isError, refetch } = useMeQuery();
  const [uploadKyc, { isLoading: isUploading }] = useUploadKycMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState<(File | null)[]>(Array(steps.length).fill(null));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFiles = [...files];
      newFiles[index] = file;
      setFiles(newFiles);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (file) formData.append('files', file);
      });

      await uploadKyc(formData).unwrap();
      setSnackbar({
        open: true,
        message: 'KYC documents uploaded successfully!',
        severity: 'success',
      });
      refetch();
      setOpenDialog(false);
      setFiles(Array(steps.length).fill(null));
      setActiveStep(0);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to upload KYC documents. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Error loading user data</Typography>;

  const user = userData?.data;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Dashboard
        </Typography>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            borderColor: (theme) => theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          Logout
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '30%' } }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 120, height: 120, mb: 2 }} />
              <Typography variant="h6">{user?.name}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
              <Typography mt={2}>
                Status: {user?.kyc?.status === 'verified' ? 'Verified' : 'Not Verified'}
              </Typography>
              {user?.kyc?.status === 'rejected' && (
                <Typography color="error">KYC Rejected. Please upload again.</Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={user?.kyc?.status === 'verified' || isUploading}
                onClick={() => setOpenDialog(true)}
                startIcon={<CloudUploadIcon />}
              >
                Upload KYC
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '70%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Details
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Account Status', user?.isVerified ? 'Verified' : 'Not Verified'],
                ['KYC Status', user?.kyc?.status || 'Not Submitted'],
                ['Account Created', new Date(user?.createdAt || '').toLocaleDateString()],
                ['Last Updated', new Date(user?.updatedAt || '').toLocaleDateString()],
              ].map(([label, value], i) => (
                <Box key={i} sx={{ width: { xs: '100%', sm: '48%' } }}>
                  <Typography variant="subtitle1">{label}</Typography>
                  <Typography variant="body1">{value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload KYC Documents</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {steps[activeStep]}
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload {steps[activeStep]}
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, activeStep)}
              />
            </Button>
            {files[activeStep] && (
              <Typography variant="body2">Selected: {files[activeStep]?.name}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={files.some((f) => !f) || isUploading}
            >
              {isUploading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!files[activeStep]}
            >
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard;
