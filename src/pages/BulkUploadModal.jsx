import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, CircularProgress, TextField,
} from "@mui/material";
import { VITE_API_BASE_URL } from "../config";

const BULK_UPLOAD_URL = `${VITE_API_BASE_URL}/upload-user-subscriptions`;

// ── Column definitions ────────────────────────────────────────
const MANDATORY_COLUMNS = ["Full Name", "Email", "Plan Name", "Start Date", "Plan Period"];
const OPTIONAL_COLUMNS  = ["Acc Partner Name", "Acc Partner Email"];
const ALL_EXPECTED_COLUMNS = [...MANDATORY_COLUMNS, ...OPTIONAL_COLUMNS];

const TEMPLATE_HEADERS   = [...MANDATORY_COLUMNS, ...OPTIONAL_COLUMNS];
const TEMPLATE_SAMPLE_ROW = [
  "John Doe", "john.doe@example.com", "INDIVIDUAL",
  "2026-05-01", "MONTH", "Partner Name", "partner@example.com",
];

// ── File validation ───────────────────────────────────────────
async function validateExcelFile(file) {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  if (!wb.SheetNames.length)
    return { valid: false, errors: ["The workbook contains no sheets."] };

  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (!rows || rows.length === 0)
    return { valid: false, errors: ["The file is empty."] };

  const headers   = rows[0].map((h) => String(h ?? "").trim());
  const errors    = [];

  const missingCols = MANDATORY_COLUMNS.filter((col) => !headers.includes(col));
  if (missingCols.length > 0)
    errors.push(`Missing required column${missingCols.length > 1 ? "s" : ""}: ${missingCols.join(", ")}.`);

  const unknownCols = headers.filter((h) => h !== "" && !ALL_EXPECTED_COLUMNS.includes(h));
  if (unknownCols.length > 0)
    errors.push(`Unexpected column${unknownCols.length > 1 ? "s" : ""} found: ${unknownCols.join(", ")}.`);

  if (errors.length > 0) {
    errors.push(`Expected columns: ${MANDATORY_COLUMNS.join(", ")} (mandatory) · ${OPTIONAL_COLUMNS.join(", ")} (optional).`);
    return { valid: false, errors };
  }

  const dataRows = rows
    .slice(1)
    .map((row, i) => ({ row, rowNum: i + 2 }))
    .filter(({ row }) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (dataRows.length === 0)
    return { valid: false, errors: ["The file has no data rows (only a header was found)."] };

  const rowErrors = [];
  for (const { row, rowNum } of dataRows) {
    for (const col of MANDATORY_COLUMNS) {
      const idx = headers.indexOf(col);
      const val = idx >= 0 ? String(row[idx] ?? "").trim() : "";
      if (!val) rowErrors.push(`Row ${rowNum}: "${col}" is empty.`);
    }
  }

  if (rowErrors.length > 0) {
    const displayed = rowErrors.slice(0, 6);
    if (rowErrors.length > 6)
      displayed.push(`…and ${rowErrors.length - 6} more issue${rowErrors.length - 6 > 1 ? "s" : ""}.`);
    return { valid: false, errors: displayed };
  }

  return { valid: true, errors: [], rowCount: dataRows.length };
}

// ── Template download ─────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
  const ws   = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROW]);
  ws["!cols"] = [20, 28, 14, 14, 12, 22, 28].map((wch) => ({ wch }));
  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "User Subscriptions");
  XLSX.writeFile(wb, "user_subscriptions_template.xlsx");
}

// ── Icons ─────────────────────────────────────────────────────
const UploadCloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const FileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const XIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Step Indicator ────────────────────────────────────────────
function Step({ label, state }) {
  const colors = {
    done:   { dot: "#15803d", text: "#15803d" },
    active: { dot: "#1976d2", text: "#1976d2" },
    error:  { dot: "#dc2626", text: "#dc2626" },
    idle:   { dot: "#d1d5db", text: "#9ca3af" },
  };
  const c = colors[state] || colors.idle;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0, transition: "background 0.2s" }} />
      <Typography fontSize="11px" color={c.text} fontWeight={state !== "idle" ? 500 : 400}>{label}</Typography>
    </Box>
  );
}

// ── Inline Feedback Banner ────────────────────────────────────
function InlineFeedback({ type, title, body }) {
  const ok = type === "success";
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mt: 1.5, p: "12px 14px", bgcolor: ok ? "#f0fdf4" : "#fef2f2", border: "0.5px solid", borderColor: ok ? "#86efac" : "#fca5a5", borderRadius: 2.5 }}>
      <Box sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: ok ? "#dcfce7" : "#fee2e2", color: ok ? "#15803d" : "#dc2626", mt: 0.1 }}>
        {ok ? <CheckIcon /> : <AlertCircleIcon />}
      </Box>
      <Box>
        <Typography fontSize="13px" fontWeight={500} color={ok ? "#14532d" : "#7f1d1d"}>{title}</Typography>
        <Typography fontSize="11.5px" color={ok ? "#166534" : "#991b1b"} mt={0.25}>{body}</Typography>
      </Box>
    </Box>
  );
}

// ── Validation Error Panel ────────────────────────────────────
function ValidationErrorPanel({ errors, onDismiss }) {
  return (
    <Box sx={{ mt: 1.5, border: "0.5px solid #fca5a5", borderRadius: 2.5, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.75, py: 1, bgcolor: "#fef2f2", borderBottom: "0.5px solid #fca5a5" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.875, color: "#dc2626" }}>
          <AlertCircleIcon />
          <Typography fontSize="12.5px" fontWeight={600} color="#b91c1c">File format invalid — upload blocked</Typography>
        </Box>
        <Box onClick={onDismiss} sx={{ cursor: "pointer", color: "#b91c1c", opacity: 0.6, "&:hover": { opacity: 1 }, display: "flex" }}><XIcon /></Box>
      </Box>
      <Box sx={{ px: 1.75, py: 1.25, bgcolor: "#fff5f5" }}>
        {errors.map((err, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 0.875, mb: i < errors.length - 1 ? 0.875 : 0 }}>
            <Box sx={{ flexShrink: 0, mt: "3px", width: 5, height: 5, borderRadius: "50%", bgcolor: "#ef4444" }} />
            <Typography fontSize="12px" color="#7f1d1d" lineHeight={1.55}>{err}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 1.75, py: 1, bgcolor: "#fef2f2", borderTop: "0.5px solid #fca5a5", display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ color: "#dc2626", display: "flex", flexShrink: 0 }}><ShieldIcon /></Box>
        <Typography fontSize="11px" color="#991b1b" lineHeight={1.5}>Download the template, fix the issues above, and re-upload.</Typography>
      </Box>
    </Box>
  );
}

// ── Group Mode Option Card ────────────────────────────────────
function ModeCard({ icon, title, description, selected, onClick, accentColor }) {
  const color = accentColor || "#1976d2";
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1, p: 2, borderRadius: 2.5, cursor: "pointer",
        border: "1.5px solid",
        borderColor: selected ? color : "#e5e7eb",
        bgcolor: selected ? `${color}08` : "#fafafa",
        transition: "all 0.18s ease",
        "&:hover": { borderColor: color, bgcolor: `${color}06` },
        position: "relative",
      }}
    >
      {/* Selected check badge */}
      {selected && (
        <Box sx={{
          position: "absolute", top: 8, right: 8,
          width: 18, height: 18, borderRadius: "50%",
          bgcolor: color, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Box>
      )}
      <Box sx={{ color: selected ? color : "#6b7280", mb: 1 }}>{icon}</Box>
      <Typography fontSize="13px" fontWeight={700} color={selected ? color : "#111827"} mb={0.375}>
        {title}
      </Typography>
      <Typography fontSize="11.5px" color="#6b7280" lineHeight={1.55}>{description}</Typography>
    </Box>
  );
}

// ── STEP 1: Group Mode Selection ──────────────────────────────
function GroupModeStep({ mode, onModeChange, groupName, onGroupNameChange, groupNameError, onContinue }) {
  return (
    <>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Info hint */}
        <Box sx={{ p: 1.5, mb: 2.5, bgcolor: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: 2 }}>
          <Typography fontSize="11.5px" color="#1e40af" lineHeight={1.65}>
            Choose how uploaded users should be organised. This can help with reporting and filtering later.
          </Typography>
        </Box>

        {/* Mode cards */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
          <ModeCard
            icon={<UsersIcon />}
            title="Add to a group"
            description="All users in this file will be placed under a shared group name."
            selected={mode === "group"}
            onClick={() => onModeChange("group")}
            accentColor="#1976d2"
          />
          <ModeCard
            icon={<UserIcon />}
            title="Keep individual"
            description="Users are added independently without any group assignment."
            selected={mode === "individual"}
            onClick={() => onModeChange("individual")}
            accentColor="#15803d"
          />
        </Box>

        {/* Group name input — only shown when group mode is selected */}
        {mode === "group" && (
          <Box sx={{
            p: 2, borderRadius: 2.5,
            bgcolor: "#f8faff",
            border: "0.5px solid #bfdbfe",
            animation: "fadeSlideIn 0.18s ease",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
              <Box sx={{ color: "#1976d2" }}><TagIcon /></Box>
              <Typography fontSize="12px" fontWeight={600} color="#1e40af">Group name</Typography>
            </Box>
            <TextField
              autoFocus
              size="small"
              fullWidth
              placeholder="e.g. Acme Corp Q2 Batch"
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              error={!!groupNameError}
              helperText={groupNameError || "Users in this file will be tagged with this group name."}
              inputProps={{ maxLength: 100 }}
              onKeyDown={(e) => e.key === "Enter" && mode === "group" && groupName.trim() && !groupNameError && onContinue()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2, fontSize: "13px", bgcolor: "#fff",
                  "& fieldset": { borderColor: groupNameError ? "#ef4444" : "#bfdbfe" },
                  "&:hover fieldset": { borderColor: groupNameError ? "#ef4444" : "#93c5fd" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
                "& .MuiFormHelperText-root": {
                  fontSize: "11px",
                  color: groupNameError ? "#ef4444" : "#6b7280",
                  ml: 0,
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.75, justifyContent: "flex-end", gap: 1 }}>
        <Button
          onClick={onContinue}
          variant="contained"
          size="small"
          disabled={mode === "group" && (!groupName.trim() || !!groupNameError)}
          sx={{
            borderRadius: 2, px: 3, fontSize: "13px", fontWeight: 600,
            bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" },
          }}
        >
          Continue →
        </Button>
      </DialogActions>
    </>
  );
}

// ── STEP 2: File Upload ───────────────────────────────────────
function FileUploadStep({
  file, dragging, validating, validationErrors, uploading, feedback,
  templateDone, downloading,
  onDrop, onDragOver, onDragLeave, onBrowse, onReset, onUpload,
  onDownloadTemplate, onBack,
  inputRef, mode, groupName,
}) {
  const isSuccess   = feedback?.type === "success";
  const hasValErrors = validationErrors.length > 0;
  const canUpload   = !!file && !validating && !hasValErrors && !uploading && !isSuccess;

  const fmtSize = (bytes) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  const stepState = (step) => {
    if (step === "template") return templateDone ? "done" : "idle";
    if (step === "file") {
      if (!file)         return templateDone ? "active" : "idle";
      if (hasValErrors)  return "error";
      if (validating)    return "active";
      return "done";
    }
    if (step === "upload") return isSuccess ? "done" : (canUpload ? "active" : "idle");
    return "idle";
  };

  return (
    <>
      <DialogContent sx={{ px: 3, py: 2.5 }}>

        {/* Mode summary badge */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1, mb: 2,
          px: 1.5, py: 0.875, borderRadius: 2,
          bgcolor: mode === "group" ? "#eff6ff" : "#f0fdf4",
          border: "0.5px solid",
          borderColor: mode === "group" ? "#bfdbfe" : "#bbf7d0",
        }}>
          <Box sx={{ color: mode === "group" ? "#1976d2" : "#15803d", display: "flex" }}>
            {mode === "group" ? <UsersIcon /> : <UserIcon />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography fontSize="12px" fontWeight={600} color={mode === "group" ? "#1e40af" : "#166534"}>
              {mode === "group" ? `Group: "${groupName}"` : "Individual mode"}
            </Typography>
            <Typography fontSize="11px" color={mode === "group" ? "#3b82f6" : "#22c55e"}>
              {mode === "group"
                ? "All uploaded users will be tagged with this group."
                : "Users will be added without any group assignment."}
            </Typography>
          </Box>
          <Box
            onClick={onBack}
            sx={{ fontSize: "11px", color: mode === "group" ? "#1976d2" : "#15803d", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}
          >
            Change
          </Box>
        </Box>

        {/* Column hint */}
        <Box sx={{ p: 1.5, mb: 2, bgcolor: "#fffbeb", border: "0.5px solid #fde68a", borderRadius: 2 }}>
          <Typography fontSize="11.5px" color="#92400e" lineHeight={1.65}>
            <strong>Mandatory:</strong> {MANDATORY_COLUMNS.join(", ")}.{" "}
            <strong>Optional:</strong> {OPTIONAL_COLUMNS.join(", ")}.
            {" "}Download the template to get the exact format.
          </Typography>
        </Box>

        {/* Drop Zone */}
        {!file && (
          <Box
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={onBrowse}
            sx={{
              border: "1.5px dashed", borderColor: dragging ? "#1976d2" : "divider",
              borderRadius: 2.5, bgcolor: dragging ? "#eff6ff" : "transparent",
              p: 3.5, textAlign: "center", cursor: "pointer",
              transition: "all 0.15s ease", "&:hover": { borderColor: "#1976d2", bgcolor: "#eff6ff" },
            }}
          >
            <Box sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5, color: "text.secondary" }}>
              <UploadCloudIcon />
            </Box>
            <Typography fontSize="13.5px" fontWeight={600} mb={0.5}>Drag & drop your Excel file here</Typography>
            <Typography fontSize="12px" color="text.secondary">
              or <span style={{ color: "#1976d2", fontWeight: 600 }}>browse to upload</span>
            </Typography>
            <Box sx={{ display: "inline-block", mt: 1, px: 1.5, py: 0.25, bgcolor: "action.hover", borderRadius: 1, fontSize: "11px", color: "text.secondary" }}>
              .xlsx or .xls · max 4 MB
            </Box>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => onDrop({ preventDefault: () => {}, dataTransfer: { files: e.target.files } })} />
          </Box>
        )}

        {/* File pill */}
        {file && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1.5, bgcolor: hasValErrors ? "#fff5f5" : "action.hover", border: "0.5px solid", borderColor: hasValErrors ? "#fca5a5" : "divider", borderRadius: 2, transition: "all 0.2s" }}>
            <FileIcon />
            <Typography fontSize="13px" fontWeight={500} sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Typography>
            <Typography fontSize="11px" color="text.secondary">{fmtSize(file.size)}</Typography>
            {!uploading && !isSuccess && (
              <Box onClick={onReset} sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", flexShrink: 0, "&:hover": { bgcolor: "#fca5a5" } }}>
                <XIcon />
              </Box>
            )}
          </Box>
        )}

        {validating && (
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
            <CircularProgress size={14} sx={{ color: "#1976d2" }} />
            <Typography fontSize="12px" color="text.secondary">Checking file format…</Typography>
          </Box>
        )}

        {!validating && hasValErrors && (
          <ValidationErrorPanel errors={validationErrors} onDismiss={onReset} />
        )}

        {uploading && (
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
            <CircularProgress size={14} />
            <Typography fontSize="12px" color="text.secondary">Uploading, please wait…</Typography>
          </Box>
        )}

        {feedback && !uploading && !hasValErrors && (
          <InlineFeedback type={feedback.type} title={feedback.title} body={feedback.body} />
        )}

        {/* Step indicators */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 2.5 }}>
          <Step label="Download template" state={stepState("template")} />
          <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
          <Step label="Select file"       state={stepState("file")} />
          <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
          <Step label="Upload"            state={stepState("upload")} />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.75, justifyContent: "space-between" }}>
        {/* Left: template + back */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            onClick={onBack}
            size="small"
            startIcon={<ArrowLeftIcon />}
            sx={{ borderRadius: 2, px: 1.5, fontSize: "12px", color: "text.secondary", "&:hover": { bgcolor: "#f3f4f6" } }}
          >
            Back
          </Button>
          <Button
            onClick={onDownloadTemplate}
            variant="contained"
            size="small"
            disabled={downloading}
            startIcon={downloading ? <CircularProgress size={12} color="inherit" /> : templateDone ? <CheckIcon /> : <DownloadIcon />}
            sx={{ borderRadius: 2, px: 2, fontSize: "12.5px", bgcolor: templateDone ? "#166534" : "#15803d", "&:hover": { bgcolor: "#166534" } }}
          >
            {downloading ? "Generating…" : templateDone ? "Downloaded" : "Template"}
          </Button>
        </Box>

        {/* Right: cancel + upload */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={onBack}
            sx={{ borderRadius: 2, px: 2, fontSize: "12.5px", borderColor: "divider", color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={onUpload}
            variant="contained"
            size="small"
            disabled={!canUpload}
            startIcon={isSuccess ? <CheckIcon /> : null}
            sx={{ borderRadius: 2, px: 2.5, minWidth: 85, fontSize: "12.5px", bgcolor: isSuccess ? "#15803d" : "#1976d2", "&:hover": { bgcolor: isSuccess ? "#166534" : "#1565c0" } }}
          >
            {uploading ? <CircularProgress size={14} color="inherit" /> : isSuccess ? "Uploaded" : validating ? "Checking…" : "Upload"}
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function BulkUploadModal({ open, onClose, agentEmail }) {
  // ── step: "mode" | "upload"
  const [step, setStep]             = useState("mode");

  // ── mode step state
  const [mode, setMode]             = useState(null);        // "group" | "individual"
  const [groupName, setGroupName]   = useState("");
  const [groupNameError, setGroupNameError] = useState("");

  // ── upload step state
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [templateDone, setTemplateDone] = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [feedback, setFeedback]     = useState(null);

  const inputRef = useRef(null);

  // ── group name validation ─────────────────────────────────
  const validateGroupName = (v) => {
    const s = v.trim();
    if (!s)          return "Group name is required.";
    if (s.length < 2) return "Must be at least 2 characters.";
    if (s.length > 100) return "Max 100 characters.";
    return "";
  };

  const handleGroupNameChange = (v) => {
    setGroupName(v);
    setGroupNameError(validateGroupName(v));
  };

  // ── Auto-close 1s after successful upload
  useEffect(() => {
    if (feedback?.type !== "success") return;
    const t = setTimeout(handleClose, 1000);
    return () => clearTimeout(t);
  }, [feedback]);

  const resetUploadState = () => {
    setFile(null);
    setValidating(false);
    setValidationErrors([]);
    setUploading(false);
    setDragging(false);
    setFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    // full reset
    setStep("mode");
    setMode(null);
    setGroupName("");
    setGroupNameError("");
    setTemplateDone(false);
    resetUploadState();
    onClose();
  };

  // ── Mode step: Continue ───────────────────────────────────
  const handleContinue = () => {
    if (mode === "group") {
      const err = validateGroupName(groupName);
      if (err) { setGroupNameError(err); return; }
    }
    if (!mode) return;
    setStep("upload");
  };

  // ── File acceptance ───────────────────────────────────────
  const quickCheck = (f) => {
    if (!f) return null;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) return "Only .xlsx or .xls files are accepted.";
    if (f.size > 4 * 1024 * 1024)       return "File size must not exceed 4 MB.";
    return null;
  };

  const acceptFile = async (f) => {
    if (!f) return;
    setFile(null); setValidationErrors([]); setFeedback(null);
    const quickErr = quickCheck(f);
    if (quickErr) { setFeedback({ type: "error", title: "Invalid file", body: quickErr }); return; }
    setFile(f); setValidating(true);
    try {
      const { valid, errors } = await validateExcelFile(f);
      if (!valid) setValidationErrors(errors);
    } catch (err) {
      setValidationErrors([`Could not read file: ${err.message}`]);
    } finally {
      setValidating(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault?.();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) acceptFile(f);
  }, []);

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file || validationErrors.length > 0) return;
    setUploading(true); setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const params = new URLSearchParams();
      if (agentEmail && agentEmail !== "—") params.set("agentMail", agentEmail);
      // groupName is mandatory in the backend signature — send empty string for individual
      params.set("groupName", mode === "group" ? groupName.trim() : "");

      const finalUrl = `${BULK_UPLOAD_URL}?${params.toString()}`;
      const res  = await fetch(finalUrl, { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok) {
        setFeedback({ type: "success", title: "Upload successful", body: json.message || "Subscriptions have been imported." });
      } else {
        setFeedback({ type: "error", title: "Upload failed", body: json.message || "Please check the file and try again." });
      }
    } catch {
      setFeedback({ type: "error", title: "Connection error", body: "Unable to reach the server. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try { await downloadTemplate(); setTemplateDone(true); }
    catch { setFeedback({ type: "error", title: "Download failed", body: "Could not generate the template. Please try again." }); }
    finally { setDownloading(false); }
  };

  // ── Header title & subtitle per step ─────────────────────
  const headerTitle    = step === "mode" ? "User grouping"  : "Bulk upload";
  const headerSubtitle = step === "mode"
    ? "Choose how to organise uploaded users"
    : "Upload user subscriptions via Excel file";

  return (
    <>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0 } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, p: 0.875, display: "flex", color: "#1976d2" }}>
              <UploadCloudIcon />
            </Box>
            <Box>
              <Typography fontWeight={600} fontSize="15px">{headerTitle}</Typography>
              <Typography fontSize="12px" color="text.secondary">{headerSubtitle}</Typography>
            </Box>
          </Box>

          {/* Step breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#1976d2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {step === "upload"
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <Typography sx={{ fontSize: "10px", color: "#fff", fontWeight: 700, lineHeight: 1 }}>1</Typography>
                }
              </Box>
              <Typography fontSize="11px" fontWeight={step === "mode" ? 700 : 500} color={step === "mode" ? "#1976d2" : "#6b7280"}>
                Grouping
              </Typography>
            </Box>
            <Box sx={{ flex: 1, height: "1px", bgcolor: step === "upload" ? "#1976d2" : "#e5e7eb", transition: "background 0.25s" }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: step === "upload" ? "#1976d2" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.25s" }}>
                <Typography sx={{ fontSize: "10px", color: step === "upload" ? "#fff" : "#9ca3af", fontWeight: 700, lineHeight: 1 }}>2</Typography>
              </Box>
              <Typography fontSize="11px" fontWeight={step === "upload" ? 700 : 400} color={step === "upload" ? "#1976d2" : "#9ca3af"}>
                Upload
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        {/* ── Step content ── */}
        {step === "mode" && (
          <GroupModeStep
            mode={mode}
            onModeChange={(m) => { setMode(m); if (m === "individual") { setGroupName(""); setGroupNameError(""); } }}
            groupName={groupName}
            onGroupNameChange={handleGroupNameChange}
            groupNameError={groupNameError}
            onContinue={handleContinue}
          />
        )}

        {step === "upload" && (
          <FileUploadStep
            file={file} dragging={dragging} validating={validating}
            validationErrors={validationErrors} uploading={uploading}
            feedback={feedback} templateDone={templateDone} downloading={downloading}
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onBrowse={() => inputRef.current?.click()}
            onReset={resetUploadState}
            onUpload={handleUpload}
            onDownloadTemplate={handleDownloadTemplate}
            onBack={() => { resetUploadState(); setStep("mode"); }}
            inputRef={inputRef}
            mode={mode}
            groupName={groupName}
          />
        )}
      </Dialog>
    </>
  );
}

export function BulkUploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}