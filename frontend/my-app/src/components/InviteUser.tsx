import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useInviteUserMutation } from '../services/api';

interface InviteUserProps {
  onClose: () => void;
}

const InviteUser: React.FC<InviteUserProps> = ({ onClose }) => {
  const [inviteUser] = useInviteUserMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await inviteUser({ name, email }).unwrap();
      setSuccessMsg('User invitation sent successfully!');
      setName('');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" mb={2}>
        Invite New User
      </Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Send Invite'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default InviteUser;
