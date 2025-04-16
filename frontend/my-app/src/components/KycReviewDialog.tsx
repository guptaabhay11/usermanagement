import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography
  } from '@mui/material';
  import React from 'react';
  
  interface KycImage {
    url: string;
    uploadedAt: string;
  }
  
  interface KycReviewDialogProps {
    open: boolean;
    onClose: () => void;
    images: { url: string; uploadedAt: string }[];
    isUpdating: boolean;
    kycStatus: 'pending' | 'verified' | 'rejected';
    onApprove: () => void;
    onReject: () => void;
  }
  const KycReviewDialog: React.FC<KycReviewDialogProps> = ({
    open,
    onClose,
    images = []
  }) => {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>KYC Documents</DialogTitle>
        <DialogContent dividers>
          {images.length === 0 ? (
            <Typography>No images submitted for KYC.</Typography>
          ) : (
            <Box display="flex" gap={2} flexWrap="wrap">
              {images.map((img, i) => (
                <Box key={i}>
                  <img
                    src={img.url}
                    alt={`KYC ${i + 1}`}
                    style={{ width: 200, borderRadius: 4 }}
                  />
                  <Typography variant="caption" display="block">
                    Uploaded: {new Date(img.uploadedAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
  
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default KycReviewDialog;
  