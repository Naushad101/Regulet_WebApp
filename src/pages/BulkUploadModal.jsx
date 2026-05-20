import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, CircularProgress,
} from "@mui/material";
import { VITE_API_BASE_URL } from "../config";

const BULK_UPLOAD_URL = `${VITE_API_BASE_URL}/upload-user-subscriptions`;

const TEMPLATE_HEADERS = [
  "Full Name", "Email", "Plan Name", "Start Date",
  "Plan Period", "Acc Partner Name", "Acc Partner Email",
];
const TEMPLATE_SAMPLE_ROW = [
  "John Doe", "john.doe@example.com", "INDIVIDUAL",
  "2026-05-01", "MONTH", "Partner Name", "partner@example.com",
];

// ── Icons ─────────────────────────────────────────────────────
const UploadCloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const FileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const XIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Step Indicator ────────────────────────────────────────────
function Step({ label, state }) {
  const colors = {
    done: { dot: "#15803d", text: "#15803d" },
    active: { dot: "#1976d2", text: "#1976d2" },
    idle: { dot: "#d1d5db", text: "#9ca3af" },
  };
  const c = colors[state] || colors.idle;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0, transition: "background 0.2s" }} />
      <Typography fontSize="11px" color={c.text} fontWeight={state !== "idle" ? 500 : 400}>
        {label}
      </Typography>
    </Box>
  );
}

// ── Inline Feedback Banner ────────────────────────────────────
function InlineFeedback({ type, title, body }) {
  const isSuccess = type === "success";
  return (
    <Box sx={{
      display: "flex", alignItems: "flex-start", gap: 1.25,
      mt: 1.5, p: "12px 14px",
      bgcolor: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: "0.5px solid",
      borderColor: isSuccess ? "#86efac" : "#fca5a5",
      borderRadius: 2.5,
    }}>
      <Box sx={{
        flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: isSuccess ? "#dcfce7" : "#fee2e2",
        color: isSuccess ? "#15803d" : "#dc2626",
        mt: 0.1,
      }}>
        {isSuccess ? <CheckIcon /> : <AlertCircleIcon />}
      </Box>
      <Box>
        <Typography fontSize="13px" fontWeight={500} color={isSuccess ? "#14532d" : "#7f1d1d"}>
          {title}
        </Typography>
        <Typography fontSize="11.5px" color={isSuccess ? "#166534" : "#991b1b"} mt={0.25}>
          {body}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Template Download ─────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROW]);
  ws["!cols"] = [20, 28, 14, 14, 12, 22, 28].map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "User Subscriptions");
  XLSX.writeFile(wb, "user_subscriptions_template.xlsx");
}

// ── Main Component ────────────────────────────────────────────
export default function BulkUploadModal({ open, onClose, agentEmail }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templateDone, setTemplateDone] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Replaces Snackbar — shown inline inside the modal
  const [feedback, setFeedback] = useState(null);
  // { type: "success" | "error", title: string, body: string }

  const inputRef = useRef(null);

  // Auto-close modal 1 s after a successful upload
  useEffect(() => {
    if (feedback?.type !== "success") return;
    const t = setTimeout(handleClose, 1000);
    return () => clearTimeout(t);
  }, [feedback]);

  const resetState = () => {
    setFile(null);
    setUploading(false);
    setDragging(false);
    setFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    setTemplateDone(false);
    onClose();
  };

  const validateAndSetFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setFeedback({ type: "error", title: "Invalid file type", body: "Only .xlsx or .xls files are accepted." });
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setFeedback({ type: "error", title: "File too large", body: "File size must not exceed 4 MB." });
      return;
    }
    setFeedback(null);
    setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      let finalUrl = BULK_UPLOAD_URL;
      if (agentEmail && agentEmail !== "—") {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}agentMail=${agentEmail}`;
      }
      
      const res = await fetch(finalUrl, { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          title: "Upload successful",
          body: json.message || "Subscriptions have been imported.",
        });
      } else {
        setFeedback({
          type: "error",
          title: "Upload failed",
          body: json.message || "Please check the file and try again.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        title: "Connection error",
        body: "Unable to reach the server. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await downloadTemplate();
      setTemplateDone(true);
    } catch {
      setFeedback({ type: "error", title: "Download failed", body: "Could not generate the template. Please try again." });
    } finally {
      setDownloading(false);
    }
  };

  const isSuccess = feedback?.type === "success";

  const stepState = (step) => {
    if (step === "template") return templateDone ? "done" : "idle";
    if (step === "file") return file ? "done" : (templateDone ? "active" : "idle");
    if (step === "upload") return isSuccess ? "done" : (file ? "active" : "idle");
    return "idle";
  };

  const fmtSize = (bytes) =>
    bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

  return (
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
            <Typography fontWeight={600} fontSize="15px">Bulk upload</Typography>
            <Typography fontSize="12px" color="text.secondary">
              Upload user subscriptions via Excel file
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>

        {/* Required columns hint */}
        <Box sx={{
          p: 1.5, mb: 2,
          bgcolor: "#fffbeb", border: "0.5px solid #fde68a", borderRadius: 2,
        }}>
          <Typography fontSize="11.5px" color="#92400e" lineHeight={1.6}>
            <strong>Required columns:</strong>{" "}
            Full Name, Email, Plan Name, Start Date, Plan Period,
            Acc Partner Name, Acc Partner Email.{" "}
            Download the template below to get started.
          </Typography>
        </Box>

        {/* Drop Zone */}
        {!file && (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            sx={{
              border: "1.5px dashed",
              borderColor: dragging ? "#1976d2" : "divider",
              borderRadius: 2.5,
              bgcolor: dragging ? "#eff6ff" : "transparent",
              p: 3.5, textAlign: "center", cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "#1976d2", bgcolor: "#eff6ff" },
            }}
          >
            <Box sx={{
              width: 42, height: 42, borderRadius: "50%",
              bgcolor: "action.hover",
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 1.5, color: "text.secondary",
            }}>
              <UploadCloudIcon />
            </Box>
            <Typography fontSize="13.5px" fontWeight={600} mb={0.5}>
              Drag & drop your Excel file here
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              or{" "}
              <span style={{ color: "#1976d2", fontWeight: 600 }}>browse to upload</span>
            </Typography>
            <Box sx={{
              display: "inline-block", mt: 1, px: 1.5, py: 0.25,
              bgcolor: "action.hover", borderRadius: 1,
              fontSize: "11px", color: "text.secondary",
            }}>
              .xlsx or .xls · max 4 MB
            </Box>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => validateAndSetFile(e.target.files[0])}
            />
          </Box>
        )}

        {/* File Pill */}
        {file && (
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1.25,
            p: 1.5, bgcolor: "action.hover",
            border: "0.5px solid", borderColor: "divider", borderRadius: 2,
          }}>
            <FileIcon />
            <Typography
              fontSize="13px" fontWeight={500} sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {file.name}
            </Typography>
            <Typography fontSize="11px" color="text.secondary">{fmtSize(file.size)}</Typography>
            {!uploading && !isSuccess && (
              <Box
                onClick={resetState}
                sx={{
                  width: 20, height: 20, borderRadius: "50%",
                  bgcolor: "#fee2e2", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#ef4444", flexShrink: 0,
                  "&:hover": { bgcolor: "#fca5a5" },
                }}
              >
                <XIcon />
              </Box>
            )}
          </Box>
        )}

        {/* Uploading indicator */}
        {uploading && (
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
            <CircularProgress size={14} />
            <Typography fontSize="12px" color="text.secondary">Uploading, please wait…</Typography>
          </Box>
        )}

        {/* ── Inline Feedback (replaces Snackbar) ── */}
        {feedback && !uploading && (
          <InlineFeedback
            type={feedback.type}
            title={feedback.title}
            body={feedback.body}
          />
        )}

        {/* Step Indicators */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 2.5 }}>
          <Step label="Download template" state={stepState("template")} />
          <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
          <Step label="Select file" state={stepState("file")} />
          <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
          <Step label="Upload" state={stepState("upload")} />
        </Box>
      </DialogContent>

      <Divider />

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 1.75, justifyContent: "space-between" }}>
        <Button
          onClick={handleDownloadTemplate}
          variant="contained"
          size="small"
          disabled={downloading}
          startIcon={
            downloading
              ? <CircularProgress size={12} color="inherit" />
              : templateDone
                ? <CheckIcon />
                : <DownloadIcon />
          }
          sx={{
            borderRadius: 2, px: 2, fontSize: "12.5px",
            bgcolor: templateDone ? "#166534" : "#15803d",
            "&:hover": { bgcolor: "#166534" },
          }}
        >
          {downloading ? "Generating…" : templateDone ? "Downloaded" : "Download Template"}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, px: 2, fontSize: "12.5px", borderColor: "divider", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            size="small"
            disabled={!file || uploading || isSuccess}
            startIcon={isSuccess ? <CheckIcon /> : null}
            sx={{
              borderRadius: 2, px: 2.5, minWidth: 85, fontSize: "12.5px",
              bgcolor: isSuccess ? "#15803d" : "#1976d2",
              "&:hover": { bgcolor: isSuccess ? "#166534" : "#1565c0" },
            }}
          >
            {uploading
              ? <CircularProgress size={14} color="inherit" />
              : isSuccess ? "Uploaded" : "Upload"
            }
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
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