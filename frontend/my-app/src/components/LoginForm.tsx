import { useState } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useLoginMutation } from "../services/api";
import PasswordInput from "./PasswordInput";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setTokens } from '../store/reducers/authReducer';

interface DecodedToken {
  id?: string;
  role?: 'USER' | 'ADMIN';
  name?: string;
  email?: string;
  [key: string]: any;
}

const validation = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 characters required")
    .max(16, "Maximum 16 characters allowed"),
});

type FormData = yup.InferType<typeof validation>;

export default function LoginForm() {
  const theme = useTheme();
  const [loginUser] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "" },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 1. Attempt login
      const loginResponse = await loginUser(data).unwrap();
      console.log("loginDetails", loginResponse)
      
      if (!loginResponse?.success || !loginResponse.data) {
        throw new Error(loginResponse?.message || "Authentication failed");
      }

      // 2. Store tokens and user data
      const { accessToken, refreshToken } = loginResponse.data;
      
      // Dispatch action to store tokens in Redux and localStorage
      dispatch(setTokens({ 
        accessToken, 
        refreshToken 
      }));

      // 3. Decode token to get user information
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      
      if (!decodedToken.id || !decodedToken.role) {
        throw new Error("Invalid token payload");
      }

      // 4. Redirect based on role
      const redirectPath = decodedToken.role === "ADMIN" 
        ? "/admin/dashboard" 
        : `/user/dashboard`; // Changed from using ID in URL
      
      navigate(redirectPath, { replace: true });
      toast.success("Login successful!");

    } catch (error: any) {
      console.error("Login error:", error);
      
      // Clear tokens on error
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      let errorMessage = "Login failed. Please try again.";
      
      if (error?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.status === 403) {
        errorMessage = "Account not verified or blocked";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      bgcolor="background.default"
    >
      <Card 
        elevation={3}
        sx={{ 
          width: '100%',
          maxWidth: 450,
          p: 3
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Please sign in to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
          />

          <PasswordInput
            fullWidth
            label="Password"
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!isValid || isSubmitting}
            sx={{ 
              mt: 3,
              height: 48,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : "Sign In"}
          </Button>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Box
                component={NavLink}
                to="/signup"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Create one
              </Box>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}