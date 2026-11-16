import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ErrorMessage from "../atoms/ErrorMessage";

const passwordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Email is invalid")),
});

const PasswordResetForm = ({ onSubmit, loading = false }) => {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = loading || isSubmitting;
  const formError = errors.root?.serverError?.message;
  const { ref: emailRef, ...emailField } = register("email");

  const handleFormSubmit = async ({ email }) => {
    setSuccessMessage("");

    try {
      await onSubmit({ email });
      reset();
      setSuccessMessage(
        "Password reset instructions have been sent to your email address.",
      );
    } catch (error) {
      setError("root.serverError", {
        type: "server",
        message:
          error?.message || "Failed to send reset email. Please try again.",
      });
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(handleFormSubmit, () => setSuccessMessage(""))}
      sx={{ mt: 1, width: "100%" }}
    >
      {formError && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage
            message={formError}
            onDismiss={() => clearErrors("root.serverError")}
          />
        </Box>
      )}

      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage
            message={successMessage}
            severity="success"
            onDismiss={() => setSuccessMessage("")}
          />
        </Box>
      )}

      <TextField
        {...emailField}
        inputRef={emailRef}
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

      <Button
        type="submit"
        fullWidth
        disabled={isLoading}
        variant="contained"
        color="primary"
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
        sx={{ mt: 3, mb: 2 }}
      >
        Send Reset Link
      </Button>
    </Box>
  );
};

export default PasswordResetForm;
