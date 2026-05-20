import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { VITE_API_BASE_URL, VITE_API_SALE_TEAM } from "../config";
import AppProfileModal, { AppProfileIcon } from "./Appprofilepage";
import BulkUploadModal, { BulkUploadIcon } from "./BulkUploadModal";

// // ── Import App Profile modal ──────────────────────────────────
// import AppProfileModal, { AppProfileIcon } from "./AppProfilePage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f0f2f5", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: "13px",
          backgroundColor: "#f8f9fa",
          color: "#374151",
          whiteSpace: "nowrap",
        },
        body: { fontSize: "13px", color: "#374151" },
      },
    },
  },
});

const HISTORY_URL = `${VITE_API_SALE_TEAM}/reference/history`;
const CHANGE_PASSWORD_URL = `${VITE_API_BASE_URL}/change-password`;
const PAGE_SIZE = 20;
const SIDEBAR_W = 200;
const HEADER_H = 64;
const MAX_MONTHS = 2;

// ── Icons ─────────────────────────────────────────────────────
const LogoutIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ExcelMenuIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15803d"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const PdfMenuIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13h1a1 1 0 0 1 0 2H9v-2zm5 0h1v4h-1zm-2.5 0v4" />
  </svg>
);
const LockIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function defaultStartDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function defaultEndDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDate(s) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function maskString(str) {
  if (!str) return "—";
  const s = String(str);
  if (s.length <= 4) {
    if (s.length === 1) return s;
    if (s.length === 2) return s[0] + "*";
    if (s.length === 3) return s[0] + "*" + s[2];
    return s[0] + s[1] + s[2] + s[3];
  }
  return `${s.slice(0, 2)}${"*".repeat(s.length - 4)}${s.slice(-2)}`;
}
function exceedsMaxRange(start, end) {
  if (!start || !end) return false;
  const s = new Date(start),
    e = new Date(end);
  if (e < s) return false;
  const monthDiff =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (monthDiff > MAX_MONTHS) return true;
  if (monthDiff === MAX_MONTHS && e.getDate() > s.getDate()) return true;
  return false;
}
function isEndBeforeStart(start, end) {
  if (!start || !end) return false;
  return new Date(end) < new Date(start);
}
function validateDates(start, end) {
  if (isEndBeforeStart(start, end))
    return "End date cannot be before start date.";
  if (exceedsMaxRange(start, end)) return "Date range cannot exceed 2 months.";
  return "";
}

function StatusChip({ status }) {
  const ok = status === "SUCCESS";
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: ok ? "#e8f5e9" : "#fff3e0",
        color: ok ? "#2e7d32" : "#e65100",
        fontWeight: 700,
        fontSize: "11px",
        height: 22,
      }}
    />
  );
}

// ── Sidebar nav item ──────────────────────────────────────────
function SidebarItem({ icon, label, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.5,
        py: 1.1,
        borderRadius: 2,
        cursor: "pointer",
        color: "#374151",
        fontSize: "14px",
        fontWeight: 500,
        "&:hover": { bgcolor: "#f0f7ff", color: "#1976d2" },
        transition: "all 0.15s ease",
      }}
    >
      <Box sx={{ color: "inherit", display: "flex" }}>{icon}</Box>
      <span>{label}</span>
    </Box>
  );
}

// ── Password Field ────────────────────────────────────────────
function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      size="small"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onToggle}
              edge="end"
              tabIndex={-1}
            >
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
    />
  );
}

// ── Change Password Modal ─────────────────────────────────────
function ChangePasswordModal({ open, onClose, agentEmail }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleClose = () => {
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setError("");
    setSuccess("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!oldPass || !newPass || !confirmPass) {
      setError("All fields are required.");
      return;
    }
    if (newPass.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (oldPass === newPass) {
      setError("New password must be different from the old password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(CHANGE_PASSWORD_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: agentEmail,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });
      const json = await res.json();
      if (res.ok && json.statusCode === 200) {
        setSuccess(json.message || "Password changed successfully!");
        setTimeout(() => handleClose(), 2000);
      } else {
        setError(
          json.message || "Failed to change password. Please try again.",
        );
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "#eff6ff",
              borderRadius: 2,
              p: 0.75,
              display: "flex",
              color: "#1976d2",
            }}
          >
            <LockIcon />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="16px">
              Change Password
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              Update your account password
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2, py: 0.5 }}>
              {success}
            </Alert>
          )}
          <PasswordField
            label="Old Password"
            value={oldPass}
            onChange={setOldPass}
            show={showOld}
            onToggle={() => setShowOld((p) => !p)}
          />
          <PasswordField
            label="New Password"
            value={newPass}
            onChange={setNewPass}
            show={showNew}
            onToggle={() => setShowNew((p) => !p)}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPass}
            onChange={setConfirmPass}
            show={showConfirm}
            onToggle={() => setShowConfirm((p) => !p)}
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 2,
            px: 2.5,
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={loading}
          sx={{ borderRadius: 2, px: 2.5, minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            "Update Password"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function AgentProfilePage({ agentData, onLogout }) {
  const firstName = agentData?.firstName || "";
  const lastName = agentData?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Agent";
  const email = agentData?.email || "—";
  const refCode = agentData?.referenceCode || "";
  const discount = agentData?.discountPercentage
    ? `${agentData.discountPercentage}%`
    : "—";
  const initials =
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "A";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalItems, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const [anchorEl, setAnchorEl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  // ── NEW: App Profile modal state ──
  const [appProfileOpen, setAppProfileOpen] = useState(false);

  const dateError = validateDates(startDate, endDate);

  const fetchHistory = useCallback(
    async (pageIndex, sd, ed) => {
      if (!refCode) return;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          referenceCode: refCode,
          startDate: sd,
          endDate: ed,
          page: pageIndex,
          size: PAGE_SIZE,
        });
        const res = await fetch(`${HISTORY_URL}?${params}`);
        const json = await res.json();
        if (res.ok && json.statusCode === 200) {
          setRows(json.data.paginatedData || []);
          setTotal(json.data.totalItems || 0);
        } else {
          setError(json.message || "Failed to fetch history.");
        }
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    },
    [refCode],
  );

  useEffect(() => {
    fetchHistory(0, startDate, endDate);
  }, [fetchHistory]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchHistory(newPage, startDate, endDate);
  };

  const handleFilter = () => {
    if (dateError) return;
    setPage(0);
    fetchHistory(0, startDate, endDate);
  };

  const fetchAllRecords = async () => {
    const size = totalItems > 0 ? totalItems : 10000;
    const params = new URLSearchParams({
      referenceCode: refCode,
      startDate,
      endDate,
      page: 0,
      size,
    });
    const res = await fetch(`${HISTORY_URL}?${params}`);
    const json = await res.json();
    if (res.ok && json.statusCode === 200) return json.data.paginatedData || [];
    throw new Error(
      json.message || "Failed to fetch all records for download.",
    );
  };

  const buildExcelData = (data) => ({
    headers: [
      "#",
      "User Name",
      "Email",
      "Plan",
      "Amount (₹)",
      "Status",
      "Payment ID",
      "Date",
    ],
    body: data.map((row, idx) => [
      idx + 1,
      maskString(row.userName),
      maskString(row.userEmail),
      row.planName,
      row.amount != null ? `₹${row.amount.toFixed(2)}` : "—",
      row.status,
      row.paymentId || "—",
      formatDateTime(row.createdAt),
    ]),
  });

  const buildPdfData = (data) => ({
    headers: [
      "#",
      "User Name",
      "Email",
      "Plan",
      "Amount (Rs.)",
      "Status",
      "Payment ID",
      "Date",
    ],
    body: data.map((row, idx) => [
      idx + 1,
      maskString(row.userName),
      maskString(row.userEmail),
      row.planName,
      row.amount != null ? `Rs. ${row.amount.toFixed(2)}` : "-",
      row.status,
      row.paymentId || "-",
      formatDateTime(row.createdAt),
    ]),
  });

  const downloadExcel = async () => {
    setDownloading(true);
    try {
      const allData = await fetchAllRecords();
      const XLSX =
        await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
      const { headers, body } = buildExcelData(allData);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
      ws["!cols"] = [4, 18, 28, 12, 12, 10, 32, 22].map((wch) => ({ wch }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reference History");
      XLSX.writeFile(wb, `reference_history_${startDate}_${endDate}.xlsx`);
    } catch (e) {
      setError(e.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const allData = await fetchAllRecords();
      await new Promise((resolve, reject) => {
        if (window.jspdf) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      await new Promise((resolve, reject) => {
        if (window.jspdf?.jsPDF?.API?.autoTable) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape" });
      const { headers, body } = buildPdfData(allData);
      doc.setFontSize(14);
      doc.text("Reference Usage History", 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `${fmtDate(startDate)} — ${fmtDate(endDate)}  ·  Ref: ${refCode}  ·  ${allData.length} records`,
        14,
        22,
      );
      doc.autoTable({
        startY: 27,
        head: [headers],
        body,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: { 0: { cellWidth: 10 }, 6: { cellWidth: 38 } },
      });
      doc.save(`reference_history_${startDate}_${endDate}.pdf`);
    } catch (e) {
      setError(e.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleMenuSelect = async (format) => {
    setAnchorEl(null);
    if (format === "excel") await downloadExcel();
    if (format === "pdf") await downloadPDF();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* ══ SIDEBAR ══ */}
        <Box
          sx={{
            width: SIDEBAR_W,
            flexShrink: 0,
            bgcolor: "#fff",
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              height: HEADER_H,
              display: "flex",
              alignItems: "center",
              px: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src="/regula_icon.png"
              alt="Logo"
              sx={{ width: 32, height: 32, objectFit: "contain" }}
            />
            <Typography fontWeight={700} fontSize="16px" color="text.primary">
              Regulet
            </Typography>
          </Box>

          {/* Nav items */}
          <Box sx={{ flex: 1, pt: 2, px: 1.5 }}>
            {/* ── NEW: App Profile entry (above Change Password) ── */}
            <SidebarItem
              icon={<AppProfileIcon />}
              label="App Profile"
              onClick={() => setAppProfileOpen(true)}
            />

            {/* Change Password */}
            <SidebarItem
              icon={<LockIcon />}
              label="Change Password"
              onClick={() => setChangePwOpen(true)}
            />
          </Box>
        </Box>

        {/* ══ MAIN AREA ══ */}
        <Box
          sx={{
            flex: 1,
            ml: `${SIDEBAR_W}px`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── HEADER ── */}
          <Box
            sx={{
              height: HEADER_H,
              bgcolor: "#fff",
              borderBottom: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 0,
              zIndex: 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="text.primary"
              >
                Reference Code Usage History
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtDate(startDate)} — {fmtDate(endDate)} &nbsp;·&nbsp;{" "}
                {totalItems} records
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box>
                  <Typography
                    fontSize="13px"
                    fontWeight={700}
                    color="text.primary"
                    lineHeight={1.2}
                  >
                    {fullName}
                  </Typography>
                  <Typography
                    fontSize="11px"
                    color="text.secondary"
                    lineHeight={1.2}
                  >
                    {email}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`Ref: ${refCode}`}
                size="small"
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              />
              <Chip
                label={`Discount: ${discount}`}
                size="small"
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              />
              <Button
                onClick={onLogout}
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon />}
                sx={{
                  borderRadius: 2,
                  px: 1.75,
                  height: 36,
                  color: "#ef4444",
                  borderColor: "#fca5a5",
                  fontWeight: 600,
                  fontSize: "13px",
                  "&:hover": { bgcolor: "#fef2f2", borderColor: "#ef4444" },
                }}
              >
                Log out
              </Button>
            </Box>
          </Box>

          {/* ── CONTENT ── */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Filters */}
                <Stack spacing={1} mb={2.5}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!dateError}
                      sx={{ width: 160 }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!dateError}
                      sx={{ width: 160 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleFilter}
                      disabled={!!dateError}
                      sx={{ borderRadius: 2, px: 2.5, height: 40 }}
                    >
                      Apply
                    </Button>

                    {/* ── Bulk Upload Button ── */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setBulkUploadOpen(true)}
                      startIcon={<BulkUploadIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        height: 40,
                        color: "#15803d",
                        borderColor: "#15803d",
                        "&:hover": {
                          bgcolor: "#f0fdf4",
                          borderColor: "#15803d",
                        },
                      }}
                    >
                      Bulk Upload
                    </Button>

                    {/* Download Button — unchanged */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      disabled={rows.length === 0 || downloading || !!dateError}
                      startIcon={
                        downloading ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                      endIcon={!downloading && <ChevronDownIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        height: 40,
                        color: "#1976d2",
                        borderColor: "#1976d2",
                        "&:hover": {
                          bgcolor: "#eff6ff",
                          borderColor: "#1976d2",
                        },
                      }}
                    >
                      {downloading ? "Downloading…" : "Download All"}
                    </Button>
                  </Stack>

                  {dateError && (
                    <Typography
                      fontSize="12px"
                      color="error.main"
                      sx={{ pl: 0.5 }}
                    >
                      ⚠ {dateError}
                    </Typography>
                  )}
                </Stack>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      borderRadius: 2,
                      minWidth: 170,
                      mt: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleMenuSelect("excel")}
                    sx={{ gap: 1.5, py: 1.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0 }}>
                      <ExcelMenuIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Excel (.xlsx)"
                      primaryTypographyProps={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#15803d",
                      }}
                    />
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuSelect("pdf")}
                    sx={{ gap: 1.5, py: 1.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0 }}>
                      <PdfMenuIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="PDF (.pdf)"
                      primaryTypographyProps={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    />
                  </MenuItem>
                </Menu>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Table */}
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>User Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                            <CircularProgress size={28} />
                          </TableCell>
                        </TableRow>
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            align="center"
                            sx={{ py: 6, color: "text.secondary" }}
                          >
                            No records found for this date range.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row, idx) => (
                          <TableRow
                            key={row.orderId || idx}
                            sx={{
                              "&:hover": { bgcolor: "#f8f9fa" },
                              "&:last-child td": { borderBottom: 0 },
                            }}
                          >
                            <TableCell sx={{ color: "text.secondary" }}>
                              {page * PAGE_SIZE + idx + 1}
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, letterSpacing: "0.02em" }}
                            >
                              {maskString(row.userName)}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.secondary",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {maskString(row.userEmail)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.planName}
                                size="small"
                                sx={{
                                  bgcolor:
                                    row.planName === "Family"
                                      ? "#f3e8ff"
                                      : "#e0f2fe",
                                  color:
                                    row.planName === "Family"
                                      ? "#7c3aed"
                                      : "#0369a1",
                                  fontWeight: 600,
                                  fontSize: "11px",
                                  height: 22,
                                }}
                              />
                            </TableCell>
                            <TableCell>₹{row.amount?.toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusChip status={row.status} />
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.secondary",
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                            >
                              {row.paymentId || "—"}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.secondary",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDateTime(row.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={totalItems}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={PAGE_SIZE}
                  rowsPerPageOptions={[PAGE_SIZE]}
                  sx={{ mt: 1, borderTop: "1px solid", borderColor: "divider" }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* ── Modals ── */}
      <ChangePasswordModal
        open={changePwOpen}
        onClose={() => setChangePwOpen(false)}
        agentEmail={email}
      />

      {/* ── NEW: App Profile Modal ── */}
      <AppProfileModal
        open={appProfileOpen}
        onClose={() => setAppProfileOpen(false)}
        refCode={refCode}
      />

      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        agentEmail={email}
      />
    </ThemeProvider>
  );
}
