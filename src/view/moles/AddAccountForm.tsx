import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  MobileStepper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type {
  LinkedAccount,
  RegistrationData,
} from "../../nonview/core/accountStorage";
import ErrorMessage from "../atoms/ErrorMessage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

// Email service provider configurations
// smtpSecure=true means implicit TLS (port 465);
// smtpSecure=false means STARTTLS on the submission port (587).
// Gmail/Outlook/Yahoo all support both
// we default to 465+implicit-TLS because it's a single negotiation and works
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
};

type ProviderKey = keyof typeof EMAIL_PROVIDERS;

const addAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Email is invalid").min(1, "Email is required"),
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
});

export type AddAccountFormData = z.infer<typeof addAccountSchema>;

interface AddAccountFormProps {
  onSubmit: (data: RegistrationData) => Promise<LinkedAccount>;
  loading?: boolean;
  onSuccess: (account: LinkedAccount) => void;
  successCtaLabel?: string;
}

type Step = 1 | 2 | "success";

interface AddAccountFormProps {
  onSubmit: (data: RegistrationData) => Promise<LinkedAccount>;
  loading?: boolean;
  onSuccess: (account: LinkedAccount) => void;
  successCtaLabel?: string;
}

// Two-step "add another account" form
const AddAccountForm = ({
  onSubmit,
  loading = false,
  onSuccess,
  successCtaLabel = "Continue",
}: AddAccountFormProps) => {
  const [step, setStep] = useState<Step>(1);

  const [formError, setFormError] = useState("");
  const [createdAccount, setCreatedAccount] = useState<LinkedAccount | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddAccountFormData>({
    resolver: zodResolver(addAccountSchema),

    shouldUnregister: false,
    defaultValues: {
      name: "",
      email: "",
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

  const handleContinue = async () => {
    setFormError("");
    const isValid = await trigger(["name", "email"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onComplete = async (data: AddAccountFormData) => {
    setFormError("");
    try {
      const account = await onSubmit(data as unknown as RegistrationData);
      setCreatedAccount(account);
      setStep("success");
    } catch (error) {
      setFormError(
        (error as Error).message || "Registration failed. Please try again.",
      );
    }
  };

  const isBusy = loading || isSubmitting;

  const handleBack = () => {
    setFormError("");
    setStep(1);
  };

  return (
    <Box
      sx={{ width: "100%" }}
      component="form"
      onSubmit={handleSubmit(onComplete)}
    >
      {step !== "success" && (
        <MobileStepper
          variant="dots"
          steps={2}
          position="static"
          activeStep={step - 1}
          backButton={<span />}
          nextButton={<span />}
          sx={{
            justifyContent: "center",
            bgcolor: "transparent",
            px: 0,
            mb: 3,
          }}
        />
      )}

      {formError && step !== "success" && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage
            message={formError}
            onDismiss={() => setFormError("")}
          />
        </Box>
      )}

      {step === 1 && (
        <Stack spacing={2}>
          <Typography variant="h6" textAlign="center">
            Account Details
          </Typography>

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
            disabled={isBusy}
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
            disabled={isBusy}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleContinue}
            disabled={isBusy}
          >
            Continue to Email Setup
          </Button>
        </Stack>
      )}

      {step === 2 && (
        <Stack spacing={2}>
          <Typography variant="h6" textAlign="center">
            Email Service Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Configure your email service connection (Gmail, Outlook, etc.)
          </Typography>

          <TextField
            select
            label="Email Service Provider"
            defaultValue="gmail"
            fullWidth
            variant="outlined"
            disabled={isBusy}
            {...register("emailServiceProvider", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const providerKey = e.target.value as ProviderKey;
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
            disabled={isBusy}
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
            disabled={isBusy}
          />

          {selectedProvider === "custom" && (
            <>
              <Typography variant="subtitle2">
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
                disabled={isBusy}
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
                disabled={isBusy}
              />

              <Typography variant="subtitle2">
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </>
          )}

          <Stack direction="row" spacing={2}>
            <Button onClick={handleBack} disabled={isBusy}>
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isBusy}
              startIcon={isBusy ? <CircularProgress size={20} /> : null}
            >
              Complete Registration
            </Button>
          </Stack>
        </Stack>
      )}

      {step === "success" && createdAccount && (
        <Stack
          spacing={2}
          alignItems="center"
          sx={{ textAlign: "center", py: 2 }}
        >
          <Typography variant="h6">Account added successfully!</Typography>
          <Typography variant="body2" color="text.secondary">
            {createdAccount.email} is now available in the account switcher.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onSuccess(createdAccount)}
          >
            {successCtaLabel}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default AddAccountForm;
