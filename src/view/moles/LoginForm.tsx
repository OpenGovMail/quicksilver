import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import ErrorMessage from "../atoms/ErrorMessage";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.email("Email is invalid").trim().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});
export type LoginFormData = z.infer<typeof loginSchema>;
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
}

const LoginForm = ({ onSubmit, loading = false }) => {
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onFormSubmit = async (data: LoginFormData) => {
    setFormError("");
    try {
      await onSubmit(data);
    } catch (error: any) {
      setFormError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{ mt: 1, width: "100%" }}
    >
      {formError && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage
            message={formError}
            onDismiss={() => setFormError("")}
          />
        </Box>
      )}

      <TextField
        {...register("email")}
        label="Email Address"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        {...register("password")}
        label="Password"
        type="password"
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="current-password"
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="Remember me"
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mt: 3, mb: 2 }}
      >
        Sign In
      </Button>
    </Box>
  );
};

export default LoginForm;
