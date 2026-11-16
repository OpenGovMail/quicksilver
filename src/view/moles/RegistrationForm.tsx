import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ErrorMessage from "../atoms/ErrorMessage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

// Email service provider configurations
// smtpSecure=true means implicit TLS (port 465); smtpSecure=false means
// STARTTLS on the submission port (587). Gmail/Outlook/Yahoo all support both
// — we default to 465+implicit-TLS because it's a single negotiation and works
// even when a network rewrites STARTTLS responses.
const EMAIL_PROVIDERS = {
  gmail: {
    name: "Gmail",
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true,
  },
  outlook: {
    name: "Outlook",
    imapHost: "outlook.office365.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    smtpSecure: false,
  },
  yahoo: {
    name: "Yahoo Mail",
    imapHost: "imap.mail.yahoo.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.mail.yahoo.com",
    smtpPort: 465,
    smtpSecure: true,
  },
  custom: {
    name: "Custom",
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true,
  },
} as const;

const registrationSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.email("Email is invalid").min(1, "Email is required").trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    emailServiceProvider: z.enum(["gmail", "outlook", "yahoo", "custom"]),
    emailAddress: z
      .email("Email address is invalid")
      .min(1, "Email address for service is required"),
    emailPassword: z.string().min(1, "Email service password is required"),
    imapHost: z.string().min(1, "IMAP host is required"),
    imapPort: z.number().int().positive("Must be a valid port"),
    imapSecure: z.boolean(),
    smtpHost: z.string().min(1, "SMTP host is required"),
    smtpPort: z.number().int().positive("Must be a valid port"),
    smtpSecure: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  loading?: boolean;
}

const RegistrationForm = ({ onSubmit, loading = false }) => {
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      emailServiceProvider: "gmail",
      emailAddress: "",
      emailPassword: "",
      imapHost: EMAIL_PROVIDERS.gmail.imapHost,
      imapPort: EMAIL_PROVIDERS.gmail.imapPort,
      imapSecure: EMAIL_PROVIDERS.gmail.imapSecure,
      smtpHost: EMAIL_PROVIDERS.gmail.smtpHost,
      smtpPort: EMAIL_PROVIDERS.gmail.smtpPort,
      smtpSecure: EMAIL_PROVIDERS.gmail.smtpSecure,
    },
  });

  const selectedProvider = useWatch({
    control,
    name: "emailServiceProvider",
  });
  const onFormSubmit = async (data: RegistrationFormData) => {
    setFormError("");
    try {
      await onSubmit(data);
    } catch (error: any) {
      setFormError(error.message || "Registration failed. Please try again.");
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
        {...register("name")}
        label="Full Name"
        type="text"
        error={!!errors.name}
        helperText={errors.name?.message}
        autoComplete="name"
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

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
        autoComplete="new-password"
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        {...register("confirmPassword")}
        label="Confirm Password"
        type="password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        autoComplete="new-password"
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Email Service Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure your email service connection (Gmail, Outlook, etc.)
      </Typography>

      <TextField
        select
        label="Email Service Provider"
        defaultValue="gmail"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        {...register("emailServiceProvider", {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const providerKey = e.target.value as keyof typeof EMAIL_PROVIDERS;
            const provider = EMAIL_PROVIDERS[providerKey];
            if (provider) {
              setValue("imapHost", provider.imapHost);
              setValue("imapPort", provider.imapPort);
              setValue("imapSecure", provider.imapSecure);
              setValue("smtpHost", provider.smtpHost);
              setValue("smtpPort", provider.smtpPort);
              setValue("smtpSecure", provider.smtpSecure);
            }
          },
        })}
      >
        {Object.entries(EMAIL_PROVIDERS).map(([key, provider]) => (
          <MenuItem key={key} value={key}>
            {provider.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        {...register("emailAddress")}
        label="Email Address"
        type="email"
        error={!!errors.emailAddress}
        helperText={
          errors.emailAddress?.message ||
          "Your actual email address (e.g., yourname@gmail.com)"
        }
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        {...register("emailPassword")}
        label="Email Password / App Password"
        type="password"
        error={!!errors.emailPassword}
        helperText={
          errors.emailPassword?.message ||
          "For Gmail/Outlook, use an app-specific password"
        }
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {selectedProvider === "custom" && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            IMAP Settings (Incoming Mail)
          </Typography>
          <TextField
            {...register("imapHost")}
            label="IMAP Host"
            type="text"
            error={!!errors.imapHost}
            helperText={errors.imapHost?.message}
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            {...register("imapPort", { valueAsNumber: true })}
            label="IMAP Port"
            type="number"
            error={!!errors.imapPort}
            helperText={errors.imapPort?.message}
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            SMTP Settings (Outgoing Mail)
          </Typography>
          <TextField
            {...register("smtpHost")}
            label="SMTP Host"
            type="text"
            error={!!errors.smtpHost}
            helperText={errors.smtpHost?.message}
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            {...register("smtpPort", { valueAsNumber: true })}
            label="SMTP Port"
            type="number"
            error={!!errors.smtpPort}
            helperText={errors.smtpPort?.message}
            required
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Button
        type="submit"
        fullWidth
        disabled={loading}
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mt: 3, mb: 2 }}
      >
        Register
      </Button>
    </Box>
  );
};

export default RegistrationForm;
