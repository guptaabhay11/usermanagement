import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useInviteUserMutation } from "../services/api";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendEmail = () => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [inviteUser, { isLoading }] = useInviteUserMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await inviteUser(formData).unwrap();
      toast.success(response.message || "Invitation sent successfully!");
      setFormData({ name: "", email: "" });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/admin/dashboard"); // Change this to your desired route
      }, 2000);
    } catch (error: any) {
      console.error("Invitation error:", error);
      
      if (error.status === 409) {
        toast.error("User with this email already exists");
      } else if (error.status === 400) {
        toast.error("Invalid email address");
      } else if (error.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to send invitation. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Typography variant="h5" gutterBottom>
        Invite a User
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Send Invitation"}
        </Button>
      </Box>
    </Container>
  );
};

export default SendEmail;