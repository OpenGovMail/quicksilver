import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ErrorMessage from "../atoms/ErrorMessage";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  type SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";

// Email service provider configurations
const EMAIL_PROVIDERS = {
  gmail: {
    name: "Gmail",
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpSecure: true,
  },
  outlook: {
    name: "Outlook",
    imapHost: "outlook.office365.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    smtpSecure: true,
  },
  yahoo: {
    name: "Yahoo Mail",
    imapHost: "imap.mail.yahoo.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.mail.yahoo.com",
    smtpPort: 587,
    smtpSecure: true,
  },
  custom: {
    name: "Custom",
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: true,
  },
};

type ProviderKey = keyof typeof EMAIL_PROVIDERS;

const profileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z
      .email("Please enter a valid email address")
      .trim()
      .min(1, "Email is required"),
    currentPassword: z.string().optional().default(""),
    newPassword: z.string().optional().default(""),
    confirmPassword: z.string().optional().default(""),
    emailServiceProvider: z.enum(["gmail", "outlook", "yahoo", "custom"]),
    emailPassword: z.string().optional().default(""),
    imapHost: z.string().optional().default(""),
    imapPort: z.coerce
      .number()
      .int("Port must be an integer")
      .positive("Port must be a positive number"),
    imapSecure: z.boolean().default(true),
    smtpHost: z.string().optional().default(""),
    smtpPort: z.coerce
      .number()
      .int("Port must be an integer")
      .positive("Port must be a positive number"),
    smtpSecure: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const isChangingPassword = Boolean(
      data.newPassword || data.confirmPassword,
    );

    if (isChangingPassword) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Current password is required to change password",
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "New passwords do not match",
        });
      }
      if (data.newPassword && data.newPassword.length < 6) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password must be at least 6 characters",
        });
      }
    }
  });

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.output<typeof profileSchema>;

/**
 * ProfileForm - Form for editing user profile
 * @param {object} user - User object with current values
 * @param {function} onSubmit - Submit callback
 */
function ProfileForm({ user, onSubmit }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultProvider: ProviderKey =
    (user.emailServiceProvider as ProviderKey) || "gmail";
  const defaultProviderConfig =
    EMAIL_PROVIDERS[defaultProvider] ?? EMAIL_PROVIDERS.gmail;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      emailServiceProvider: defaultProvider,
      emailPassword: user.emailPassword ?? "",
      imapHost: user.imapHost ?? defaultProviderConfig.imapHost,
      imapPort: user.imapPort ?? defaultProviderConfig.imapPort,
      imapSecure: user.imapSecure ?? defaultProviderConfig.imapSecure,
      smtpHost: user.smtpHost ?? defaultProviderConfig.smtpHost,
      smtpPort: user.smtpPort ?? defaultProviderConfig.smtpPort,
      smtpSecure: user.smtpSecure ?? defaultProviderConfig.smtpSecure,
    },
  });
  const selectedProvider = useWatch({
    control,
    name: "emailServiceProvider",
  });

  const onValidSubmit: SubmitHandler<ProfileFormOutput> = async (data) => {
    setError("");
    setSuccess("");

    try {
      const updateData: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        emailServiceProvider: data.emailServiceProvider,
        emailPassword: data.emailPassword,
        imapHost: data.imapHost,
        imapPort: Number(data.imapPort),
        imapSecure: data.imapSecure,
        smtpHost: data.smtpHost,
        smtpPort: Number(data.smtpPort),
        smtpSecure: data.smtpSecure,
      };

      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      await onSubmit(updateData);
      setSuccess("Profile updated successfully");

      // Reset sensitive password fields after success
      resetField("currentPassword", { defaultValue: "" });
      resetField("newPassword", { defaultValue: "" });
      resetField("confirmPassword", { defaultValue: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onValidSubmit)}
      sx={{ maxWidth: 500, mx: "auto", px: 2 }}
    >
      <Stack spacing={3}>
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError("")} />
        )}
        {success && (
          <ErrorMessage
            message={success}
            variant="success"
            onDismiss={() => setSuccess("")}
          />
        )}

        <TextField
          label="Name"
          autoComplete="name"
          fullWidth
          variant="outlined"
          disabled={isSubmitting}
          {...register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />

        <TextField
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          disabled={isSubmitting}
          {...register("email")}
          error={Boolean(errors.email)}
          helperText={
            errors.email?.message ||
            "Your actual email address (e.g., yourname@gmail.com)"
          }
        />

        <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
          <TextField
            label="Current Password"
            type="password"
            placeholder="Enter current password to change"
            fullWidth
            variant="outlined"
            disabled={isSubmitting}
            {...register("currentPassword")}
            error={Boolean(errors.currentPassword)}
            helperText={errors.currentPassword?.message}
          />
        </Box>

        <TextField
          label="New Password"
          type="password"
          placeholder="Leave blank to keep current password"
          fullWidth
          variant="outlined"
          disabled={isSubmitting}
          {...register("newPassword")}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword?.message}
        />

        <TextField
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          fullWidth
          variant="outlined"
          disabled={isSubmitting}
          {...register("confirmPassword")}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
        />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Email Service Configuration
        </Typography>

        <Controller
          name="emailServiceProvider"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Email Service Provider"
              disabled={isSubmitting}
              fullWidth
              variant="outlined"
              error={Boolean(errors.emailServiceProvider)}
              helperText={errors.emailServiceProvider?.message}
              onChange={(e) => {
                const val = e.target.value as ProviderKey;
                field.onChange(val);

                // Auto-fill server presets on provider change
                const provider = EMAIL_PROVIDERS[val];
                if (provider) {
                  setValue("imapHost", provider.imapHost, {
                    shouldDirty: true,
                  });
                  setValue("imapPort", provider.imapPort, {
                    shouldDirty: true,
                  });
                  setValue("imapSecure", provider.imapSecure, {
                    shouldDirty: true,
                  });
                  setValue("smtpHost", provider.smtpHost, {
                    shouldDirty: true,
                  });
                  setValue("smtpPort", provider.smtpPort, {
                    shouldDirty: true,
                  });
                  setValue("smtpSecure", provider.smtpSecure, {
                    shouldDirty: true,
                  });
                }
              }}
            >
              {Object.entries(EMAIL_PROVIDERS).map(([key, provider]) => (
                <MenuItem key={key} value={key}>
                  {provider.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Email Password / App Password"
          type="password"
          helperText="For Gmail/Outlook, use an app-specific password"
          disabled={isSubmitting}
          fullWidth
          variant="outlined"
          {...register("emailPassword")}
          error={Boolean(errors.emailPassword)}
        />

        {selectedProvider === "custom" && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              IMAP Settings (Incoming Mail)
            </Typography>
            <TextField
              label="IMAP Host"
              type="text"
              disabled={isSubmitting}
              fullWidth
              variant="outlined"
              {...register("imapHost")}
              error={Boolean(errors.imapHost)}
              helperText={errors.imapHost?.message}
            />
            <TextField
              label="IMAP Port"
              type="number"
              disabled={isSubmitting}
              fullWidth
              variant="outlined"
              {...register("imapPort", { valueAsNumber: true })}
              error={Boolean(errors.imapPort)}
              helperText={errors.imapPort?.message}
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              SMTP Settings (Outgoing Mail)
            </Typography>
            <TextField
              label="SMTP Host"
              type="text"
              disabled={isSubmitting}
              fullWidth
              variant="outlined"
              {...register("smtpHost")}
              error={Boolean(errors.smtpHost)}
              helperText={errors.smtpHost?.message}
            />
            <TextField
              label="SMTP Port"
              type="number"
              disabled={isSubmitting}
              fullWidth
              variant="outlined"
              {...register("smtpPort", { valueAsNumber: true })}
              error={Boolean(errors.smtpPort)}
              helperText={errors.smtpPort?.message}
            />
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          fullWidth
        >
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}

export default ProfileForm;
