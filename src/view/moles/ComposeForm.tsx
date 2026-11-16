import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Box,
  FormHelperText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useRef } from "react";
import { getTemplate } from "../../nonview/email/templates";
import ComposeActions from "./ComposeActions";
import RecipientInput from "./RecipientInput";
import TemplateEditor from "./TemplateEditor";
import TemplateGallery from "./TemplateGallery";
import type { ComposeFormValues } from "./ComposePanel";
import {
  Controller,
  useFormState,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";

interface ComposeFormProps {
  control: Control<ComposeFormValues>;
  setValue: UseFormSetValue<ComposeFormValues>;
  recipientInputRef: React.RefObject<any>;
  contacts: any[];
  onAttachFiles: (files: File[]) => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onTemplateSelect: (template: any) => void;
}

const ComposeForm = ({
  control,
  setValue,
  recipientInputRef,
  contacts,
  onAttachFiles,
  onSaveDraft,
  onDiscard,
  onTemplateSelect,
}) => {
  const fileInputRef = useRef(null);

  const { errors } = useFormState({ control });
  const mode = useWatch({ control, name: "mode" });
  const templateId = useWatch({ control, name: "templateId" });
  const templateValues = useWatch({ control, name: "templateValues" });

  const selectedTemplate = templateId ? getTemplate(templateId) : undefined;

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onAttachFiles) {
      onAttachFiles(files);
    }
    e.target.value = "";
  };

  return (
    <Box sx={{ p: 2 }}>
      <Controller
        name="recipients"
        control={control}
        render={({ field }) => (
          <>
            <RecipientInput
              ref={recipientInputRef}
              value={field.value}
              onChange={field.onChange}
              suggestions={contacts}
            />
            {errors.recipients?.message && (
              <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                {errors.recipients.message as string}
              </FormHelperText>
            )}
          </>
        )}
      />

      <Box sx={{ mt: 2 }}>
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Subject"
              placeholder="Subject"
              fullWidth
              variant="outlined"
              error={Boolean(errors.subject)}
              helperText={errors.subject?.message?.toString()}
            />
          )}
        />
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={field.value}
              onChange={(_, v) => v && field.onChange(v)}
              aria-label="compose mode"
            >
              <ToggleButton value="plaintext" aria-label="plain text">
                <NotesIcon fontSize="small" sx={{ mr: 0.5 }} />
                Plain text
              </ToggleButton>
              <ToggleButton value="template" aria-label="template">
                <DashboardCustomizeOutlinedIcon
                  fontSize="small"
                  sx={{ mr: 0.5 }}
                />
                Template
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {mode === "template" ? (
        <Box sx={{ mt: 2 }}>
          {selectedTemplate ? (
            <TemplateEditor
              template={selectedTemplate}
              values={templateValues}
              onChange={(key, val) =>
                setValue(
                  "templateValues",
                  { ...templateValues, [key]: val },
                  { shouldDirty: true },
                )
              }
              onChangeTemplate={() => setValue("templateId", null)}
            />
          ) : (
            <TemplateGallery
              onSelect={onTemplateSelect}
              selectedId={templateId}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Write your message..."
                fullWidth
                variant="outlined"
                multiline
                minRows={10}
                maxRows={20}
                error={Boolean(errors.body)}
                helperText={errors.body?.message?.toString()}
              />
            )}
          />
        </Box>
      )}

      <ComposeActions
        onAttach={handleAttachClick}
        onSaveDraft={onSaveDraft}
        onDiscard={onDiscard}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFilesSelected}
      />
    </Box>
  );
};

export default ComposeForm;
