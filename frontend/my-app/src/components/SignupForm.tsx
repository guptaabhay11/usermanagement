import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useRegisterMutation } from "../services/api";
import PasswordInput from "./PasswordInput";

const validation = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required").min(5).max(16),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

type FormData = yup.InferType<typeof validation>;

export default function SignupForm() {
  const theme = useTheme();
  const [registerUser] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    resolver: yupResolver(validation),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data).unwrap();
      toast.success("User registered successfully!");
      navigate("/login", { replace: true });
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0]?.msg;
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!"
      );
    }
  };

  return (
    <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Card variant="outlined" sx={{ maxWidth: 400, flex: 1, mx: "auto" }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Create Account
            </Typography>
            <Typography my={1}>Register to get started.</Typography>

            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Name"
              placeholder="Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Email"
              placeholder="Email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <PasswordInput
              sx={{ mt: 2 }}
              fullWidth
              label="Password"
              placeholder="Password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <PasswordInput
              sx={{ mt: 2 }}
              fullWidth
              label="Confirm Password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              sx={{ my: 2 }}
              variant="contained"
              fullWidth
              disabled={!isValid}
            >
              Sign up
            </Button>

            <Typography>
              Already have an account?{" "}
              <NavLink to="/login" style={{ color: theme.palette.primary.main }}>
                Log in
              </NavLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
