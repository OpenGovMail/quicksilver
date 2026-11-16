import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ErrorMessage from "../atoms/ErrorMessage";

const PasswordResetForm = ({ onSubmit, loading = false }) => {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const isLoading = loading || isSubmitting;
  const formError = errors.root?.serverError?.message;

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

      <Controller
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Email is invalid",
          },
        }}
        render={({ field: { ref, ...fieldProps }, fieldState: { error } }) => (
          <TextField
            {...fieldProps}
            inputRef={ref}
            label="Email Address"
            type="email"
            error={!!error}
            helperText={error?.message}
            autoComplete="email"
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
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
      </Button>x
    </Box>
  );
};

export default PasswordResetForm;
