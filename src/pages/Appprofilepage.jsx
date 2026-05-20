import React, { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, Box, Typography, Avatar, Chip,
  Button, TextField, IconButton, Tooltip, Collapse, Popover, Pagination,
  CircularProgress
} from "@mui/material";
import { VITE_API_BASE_URL } from "../config";

// ── Google Font & Animations injection ────────────────────────
const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes slideInRight {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes slideInLeft {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}
`;

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:          "#f9fafb",
  surface:     "#ffffff",
  surfaceHov:  "#f3f4f6",
  border:      "#e5e7eb",
  borderHov:   "#d1d5db",
  primary:     "#1976d2",
  primaryDim:  "rgba(25,118,210,0.08)",
  primaryGlow: "rgba(25,118,210,0.2)",
  success:     "#2e7d32",
  successDim:  "rgba(46,125,50,0.1)",
  warning:     "#ed6c02",
  warningDim:  "rgba(237,108,2,0.1)",
  danger:      "#ef4444",
  dangerDim:   "rgba(239,68,68,0.1)",
  textPri:     "#111827",
  textSec:     "#4b5563",
  textMute:    "#6b7280",
  mono:        "'JetBrains Mono', monospace",
  font:        "'DM Sans', 'Segoe UI', sans-serif",
};

// ── API Config ────────────────────────────────────────────────
const API_BASE_URL = VITE_API_BASE_URL;

// ── Create App Profile API call ───────────────────────────────
async function createAppProfileAPI(profileName, apps) {
  const requestBody = {
    appProfileName: profileName,
    assigned: null,
    appDetails: apps.map((app) => ({
      appId:       app.id,
      appName:     app.name,
      packageName: app.pkg,
    })),
  };

  const response = await fetch(`${API_BASE_URL}/app-profile`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errMsg = "Unknown error";
    try {
      const text = await response.text();
      const errJson = JSON.parse(text);
      errMsg = errJson.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return await response.json();
  // Expected response: { statusCode: 200, message: "App Profile created successfully.", status: "OK" }
}

// ── Fetch App Profiles API call ───────────────────────────────
async function fetchAppProfilesAPI(page = 0, size = 20) {
  const response = await fetch(`${API_BASE_URL}/get-app-profiles?page=${page}&size=${size}`);
  
  if (!response.ok) {
    let errMsg = "Unknown error";
    try {
      const text = await response.text();
      const errJson = JSON.parse(text);
      errMsg = errJson.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  
  return await response.json();
}

// ── Update App Profile API call ───────────────────────────────
async function updateAppProfileAPI(id, profileName, assigned, apps, userEmails = []) {
  const requestBody = {
    appProfileName: profileName,
    assigned: !!assigned,
    appDetails: apps.map((app) => ({
      appId:       app.id,
      appName:     app.name,
      packageName: app.pkg,
    })),
    users: userEmails
  };

  const response = await fetch(`${API_BASE_URL}/app-profile/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errMsg = "Unknown error";
    try {
      const text = await response.text();
      const errJson = JSON.parse(text);
      errMsg = errJson.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return await response.json();
}

// ── Initial data ──────────────────────────────────────────────
const INITIAL_PROFILES = [];
const INITIAL_USERS = [];

const PROFILE_COLORS = ["#4f8ef7","#34d399","#a78bfa","#fb7185","#fbbf24","#22d3ee","#f97316","#e879f9"];

// ── Helpers ───────────────────────────────────────────────────
function inits(name) { return name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??"; }

// ── SVG Icons ─────────────────────────────────────────────────
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.25s cubic-bezier(.4,0,.2,1)", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconPackage = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// ── Shared input style ────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontFamily: C.font, fontSize: "13px", color: C.textPri, borderRadius: "10px", bgcolor: C.bg,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: C.borderHov },
    "&.Mui-focused fieldset": { borderColor: C.primary, boxShadow: `0 0 0 3px ${C.primaryGlow}` },
  },
  "& .MuiInputLabel-root": { fontFamily: C.font, fontSize: "13px", color: C.textSec },
  "& .MuiInputLabel-root.Mui-focused": { color: C.primary },
};

// ── Tag pill ──────────────────────────────────────────────────
function Tag({ label, color, onRemove, small }) {
  const c = color || C.primary;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: small ? 1 : 1.25, py: small ? 0.25 : 0.375,
      borderRadius: "8px",
      bgcolor: `${c}18`, border: `1px solid ${c}30`,
      fontSize: small ? "11px" : "12px", fontWeight: 600, color: c, fontFamily: C.font,
      lineHeight: 1.5,
    }}>
      {label}
      {onRemove && (
        <Box component="span" onClick={onRemove} sx={{
          display: "flex", cursor: "pointer", opacity: 0.55,
          "&:hover": { opacity: 1 }, ml: 0.25,
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </Box>
      )}
    </Box>
  );
}

// ── Action icon button ────────────────────────────────────────
function ABtn({ icon, tip, onClick, danger, primary }) {
  return (
    <Tooltip title={tip} placement="top">
      <IconButton size="small" onClick={onClick} sx={{
        borderRadius: "8px", width: 28, height: 28,
        color: danger ? C.danger : primary ? C.primary : C.textSec,
        "&:hover": {
          bgcolor: danger ? C.dangerDim : primary ? C.primaryDim : C.surfaceHov,
          color: danger ? C.danger : primary ? C.primary : C.textPri,
        },
        transition: "all 0.15s",
      }}>{icon}</IconButton>
    </Tooltip>
  );
}

// ── Multi-select dropdown ─────────────────────────────────────
function MultiSelect({ options, selected, onChange, placeholder, renderOption }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState("");
  const open = Boolean(anchorEl);

  const filtered = options.filter(o => !search || (o.name && o.name.toLowerCase().includes(search.toLowerCase())));

  return (
    <Box sx={{ position: "relative" }}>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 1.5, py: 1, borderRadius: "10px",
        border: `1px solid ${open ? C.primary : C.border}`,
        bgcolor: C.bg, cursor: "pointer", userSelect: "none",
        boxShadow: open ? `0 0 0 3px ${C.primaryGlow}` : "none",
        transition: "all 0.15s",
        "&:hover": { borderColor: open ? C.primary : C.borderHov },
      }}>
        <Typography sx={{ fontSize: "13px", color: selected.size ? C.textPri : C.textMute, fontFamily: C.font }}>
          {selected.size ? `${selected.size} selected` : placeholder}
        </Typography>
        <Box sx={{ color: C.textMute, display: "flex" }}><IconChevron open={open} /></Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              width: anchorEl ? anchorEl.clientWidth : 'auto',
              bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              display: "flex", flexDirection: "column",
              maxHeight: 280,
              overflow: "hidden"
            }
          }
        }}
      >
        <Box sx={{ p: 1, borderBottom: `1px solid ${C.border}` }}>
          <input
            autoFocus
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "6px 10px", borderRadius: "6px",
              border: `1px solid ${C.border}`, background: C.bg,
              color: C.textPri, fontFamily: C.font, fontSize: "13px",
              outline: "none",
            }}
          />
        </Box>
        <Box sx={{
          overflowY: "auto", flex: 1,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 2 },
        }}>
          {filtered.length === 0 && (
            <Box sx={{ px: 2, py: 2, fontSize: "12px", color: C.textMute, fontFamily: C.font, textAlign: "center" }}>No results found</Box>
          )}
          {filtered.map((opt, i) => (
            <Box key={opt.id} onClick={() => {
              const s = new Set(selected);
              s.has(opt.id) ? s.delete(opt.id) : s.add(opt.id);
              onChange(s);
            }} sx={{
              display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.125, cursor: "pointer",
              borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
              bgcolor: selected.has(opt.id) ? C.primaryDim : "transparent",
              "&:hover": { bgcolor: selected.has(opt.id) ? C.primaryDim : C.surfaceHov },
              transition: "background 0.1s",
            }}>
              <Box sx={{
                width: 16, height: 16, borderRadius: "5px", flexShrink: 0,
                border: `1.5px solid ${selected.has(opt.id) ? C.primary : C.textMute}`,
                bgcolor: selected.has(opt.id) ? C.primary : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
              }}>
                {selected.has(opt.id) && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </Box>
              {renderOption(opt)}
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}

// ── Shared Confirm Dialog ─────────────────────────────────────
function ConfirmDialog({ open, title, content, confirmText = "Delete", onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: 400, width: "100%", bgcolor: C.surface, backgroundImage: "none" } }}>
      <DialogContent sx={{ p: 2.5 }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.textPri, fontFamily: C.font, mb: 1 }}>{title}</Typography>
        <Typography sx={{ fontSize: "14px", color: C.textSec, fontFamily: C.font, mb: 3 }}>{content}</Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button onClick={onCancel} sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 600, color: C.textSec, "&:hover": { bgcolor: C.surfaceHov } }}>Cancel</Button>
          <Button onClick={onConfirm} disableElevation sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 700, bgcolor: C.danger, color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>{confirmText}</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ── APP PROFILES TAB ─────────────────────────────────────────
function AppProfilesTab({ profiles, setProfiles, users, setUsers }) {
  const [newName, setNewName]       = useState("");
  const [expanded, setExpanded]     = useState(new Set());
  const [editingId, setEditingId]   = useState(null);
  const [editName, setEditName]     = useState("");
  const [editPkg, setEditPkg]       = useState("");
  const [addingTo, setAddingTo]     = useState(null);
  const [newAppName, setNewAppName] = useState("");
  const [newAppPkg, setNewAppPkg]   = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editProfileName, setEditProfileName]   = useState("");

  // ── API state ────────────────────────────────────────────────
  const [creating, setCreating]   = useState(false);
  const [apiToast, setApiToast]   = useState({ msg: "", type: "" }); // type: "success" | "error" | "info"

  // ── Pagination & Search state ────────────────────────────────
  const [profileSearch, setProfileSearch] = useState("");
  const [profilePage, setProfilePage] = useState(1);
  const [slideDirP, setSlideDirP] = useState("right");
  const profilesPerPage = 5;

  const filteredProfiles = profiles.filter(p =>
    !profileSearch ||
    p.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
    p.apps.some(a => a.name.toLowerCase().includes(profileSearch.toLowerCase()) || a.pkg.toLowerCase().includes(profileSearch.toLowerCase()))
  );
  const totalProfilePages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const displayedProfiles = filteredProfiles.slice((profilePage - 1) * profilesPerPage, profilePage * profilesPerPage);

  React.useEffect(() => {
    setSlideDirP("right");
    setProfilePage(1);
  }, [profileSearch]);

  const nextId = useRef(1);

  // ── Toast helper ─────────────────────────────────────────────
  const flashApiToast = (msg, type = "success") => {
    setApiToast({ msg, type });
    setTimeout(() => setApiToast({ msg: "", type: "" }), 4000);
  };

  const toggleExpand = (pid) => {
    const s = new Set(expanded);
    s.has(pid) ? s.delete(pid) : s.add(pid);
    setExpanded(s);
  };

  // ── Create profile — calls API then updates local state ───────
  const addProfile = async () => {
    if (!newName.trim() || creating) return;

    const id    = Date.now();
    const color = PROFILE_COLORS[profiles.length % PROFILE_COLORS.length];
    const newProfile = { id, name: newName.trim(), color, apps: [] };

    setCreating(true);
    flashApiToast("Creating profile…", "info");

    try {
      // Call the Create App Profile API
      const result = await createAppProfileAPI(newProfile.name, newProfile.apps);

      // Success: add to local state and show API success message
      setProfiles([...profiles, newProfile]);
      setExpanded(new Set([...expanded, id]));
      setNewName("");
      flashApiToast(result.message || "App Profile created successfully.", "success");
    } catch (err) {
      console.error("Create App Profile API Error:", err);
      // Graceful degradation: still add locally, but warn the user
      setProfiles([...profiles, newProfile]);
      setExpanded(new Set([...expanded, id]));
      setNewName("");
      flashApiToast(`Profile added locally. API error: ${err.message}`, "error");
    } finally {
      setCreating(false);
    }
  };

  const startRenameProfile = (pid) => {
    const p = profiles.find((x) => x.id === pid);
    setEditingProfileId(pid);
    setEditProfileName(p.name);
  };

  const saveProfileRename = async (pid) => {
    if (!editProfileName.trim()) return;
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const originalName = p.name;
    const newName = editProfileName.trim();
    setProfiles(profiles.map((x) => x.id === pid ? { ...x, name: newName } : x));
    setEditingProfileId(null);
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, newName, p.assigned, p.apps, pUsers);
      flashApiToast("Profile renamed successfully", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id === pid ? { ...x, name: originalName } : x));
      flashApiToast(`Failed to rename: ${err.message}`, "error");
    }
  };

  const doDeleteProfile = (pid) => {
    setProfiles(profiles.filter((x) => x.id !== pid));
    setUsers(users.map((u) => ({ ...u, profiles: u.profiles.filter((x) => x !== pid) })));
    setConfirmDel(null);
  };

  const saveEditApp = async (pid) => {
    if (!editName.trim() || !editPkg.trim()) return;
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newApps = p.apps.map((a) => a.id !== editingId ? a : { ...a, name: editName.trim(), pkg: editPkg.trim() });
    const originalApps = p.apps;
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setEditingId(null);
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers);
      flashApiToast("App updated successfully", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to update app: ${err.message}`, "error");
    }
  };

  const saveNewApp = async (pid) => {
    if (!newAppName.trim() || !newAppPkg.trim()) return;
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const aid = (nextId.current++).toString();
    const newApp = { id: aid, name: newAppName.trim(), pkg: newAppPkg.trim() };
    const newApps = [...p.apps, newApp];
    const originalApps = p.apps;
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setAddingTo(null); setNewAppName(""); setNewAppPkg("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers);
      flashApiToast("App added successfully", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to add app: ${err.message}`, "error");
    }
  };

  const doDeleteApp = async (pid, aid) => {
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newApps = p.apps.filter((a) => a.id !== aid);
    const originalApps = p.apps;
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setConfirmDel(null);
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers);
      flashApiToast("App deleted successfully", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to delete app: ${err.message}`, "error");
    }
  };

  const inlineInput = (val, onChange, onEnter, placeholder, mono) => (
    <input
      autoFocus={!mono}
      value={val}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder={placeholder}
      style={{
        fontFamily: mono ? C.mono : C.font,
        fontSize: mono ? "11.5px" : "13px",
        padding: "6px 10px", borderRadius: 8,
        border: `1px solid ${C.primary}`,
        background: C.bg, color: mono ? C.textSec : C.textPri,
        width: "100%", outline: "none",
        boxShadow: `0 0 0 2px ${C.primaryGlow}`,
      }}
    />
  );

  // Toast color map
  const toastColorMap = { success: C.success, error: C.danger, info: C.primary };

  return (
    <Box>
      {/* Create profile card */}
      <Box sx={{
        bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px",
        p: 2.5, mb: 2.5, position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", bgcolor: C.primaryGlow, filter: "blur(40px)", pointerEvents: "none" }} />
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".09em", mb: 1.5, fontFamily: C.font }}>
          New profile
        </Typography>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <TextField
            size="small" fullWidth placeholder="e.g. BNT Core Suite"
            value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !creating && addProfile()}
            disabled={creating}
            sx={inputSx}
          />
          <Button
            onClick={addProfile}
            disabled={!newName.trim() || creating}
            sx={{
              borderRadius: "10px", px: 2.5, height: 38, whiteSpace: "nowrap", flexShrink: 0,
              bgcolor: newName.trim() && !creating ? C.primary : C.surfaceHov,
              color: newName.trim() && !creating ? "#fff" : C.textMute,
              border: `1px solid ${newName.trim() && !creating ? C.primary : C.border}`,
              fontFamily: C.font, fontWeight: 700, fontSize: "13px", textTransform: "none",
              boxShadow: newName.trim() && !creating ? `0 4px 12px ${C.primaryGlow}` : "none",
              "&:hover": { bgcolor: newName.trim() && !creating ? "#3a7de8" : C.surfaceHov },
              transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 0.75,
              minWidth: 110,
            }}>
            {creating
              ? <><CircularProgress size={12} sx={{ color: C.textMute }} />&nbsp;Creating…</>
              : <><IconPlus />&nbsp;Create</>
            }
          </Button>
        </Box>

        {/* API feedback toast */}
        {apiToast.msg && (
          <Box sx={{
            mt: 1.5, px: 1.5, py: 1, borderRadius: "9px",
            bgcolor: `${toastColorMap[apiToast.type]}12`,
            border: `1px solid ${toastColorMap[apiToast.type]}30`,
            display: "flex", alignItems: "center", gap: 1,
            animation: "fadeIn 0.2s ease",
          }}>
            {apiToast.type === "info" && <CircularProgress size={11} sx={{ color: C.primary }} />}
            <Typography sx={{
              fontSize: "12px", fontWeight: 600,
              color: toastColorMap[apiToast.type],
              fontFamily: C.font,
            }}>
              {apiToast.type === "success" && "✓ "}
              {apiToast.type === "error" && "⚠ "}
              {apiToast.msg}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Confirm Deletion"
        content={confirmDel?.label}
        onConfirm={() => confirmDel.type === "profile" ? doDeleteProfile(confirmDel.pid) : doDeleteApp(confirmDel.pid, confirmDel.aid)}
        onCancel={() => setConfirmDel(null)}
      />

      {/* Count label & Search */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", mb: 1, fontFamily: C.font }}>
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
        </Typography>
        <input
          placeholder="Search profiles or apps..."
          value={profileSearch}
          onChange={(e) => setProfileSearch(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            border: `1px solid ${C.border}`, background: C.surface,
            color: C.textPri, fontFamily: C.font, fontSize: "13px",
            outline: "none", width: "240px", maxWidth: "100%",
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.02)`
          }}
        />
      </Box>

      {displayedProfiles.length === 0 && (
        <Box sx={{ textAlign: "center", py: 5, color: C.textMute, fontSize: "13px", fontFamily: C.font }}>
          {profileSearch ? "No matching profiles found" : "No profiles yet"}
        </Box>
      )}

      <Box key={`${profilePage}-${slideDirP}`} sx={{ animation: `${slideDirP === "right" ? "slideInRight" : "slideInLeft"} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)` }}>
      {displayedProfiles.map((p) => {
        const isOpen = expanded.has(p.id);
        return (
          <Box key={p.id} sx={{
            border: `1px solid ${isOpen ? `${p.color}30` : C.border}`,
            borderRadius: "14px", mb: 1.25, overflow: "hidden", bgcolor: C.surface,
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: isOpen ? `0 0 0 1px ${p.color}15, 0 8px 28px rgba(0,0,0,0.08)` : "none",
          }}>
            {/* Header row */}
            <Box onClick={() => toggleExpand(p.id)} sx={{
              display: "flex", alignItems: "center", gap: 1.25, px: 2, py: 1.625,
              cursor: "pointer", "&:hover": { bgcolor: C.surfaceHov }, transition: "background 0.15s",
            }}>
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: p.color, boxShadow: `0 0 8px ${p.color}88`, flexShrink: 0 }} />

              {editingProfileId === p.id ? (
                <Box onClick={(e) => e.stopPropagation()} sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  {inlineInput(editProfileName, setEditProfileName, () => saveProfileRename(p.id), "Profile name", false)}
                  <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveProfileRename(p.id)} primary />
                  <ABtn icon={<IconX />}     tip="Cancel" onClick={() => setEditingProfileId(null)} />
                </Box>
              ) : (
                <>
                  <Typography sx={{ flex: 1, fontWeight: 700, fontSize: "13.5px", color: C.textPri, fontFamily: C.font }}>{p.name}</Typography>
                  <Tag label={`${p.apps.length} app${p.apps.length !== 1 ? "s" : ""}`} color={p.color} small />
                  <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 0.25 }}>
                    <ABtn icon={<IconPencil />} tip="Rename" onClick={() => startRenameProfile(p.id)} />
                    <ABtn icon={<IconTrash />}  tip="Delete" danger
                      onClick={() => setConfirmDel({ type: "profile", pid: p.id, label: `Delete "${p.name}"? It'll be removed from all users.` })} />
                  </Box>
                  <Box sx={{ color: C.textMute, display: "flex", ml: 0.5 }}><IconChevron open={isOpen} /></Box>
                </>
              )}
            </Box>

            {/* Expanded body */}
            <Collapse in={isOpen}>
              <Box sx={{ borderTop: `1px solid ${C.border}` }}>
                {/* App table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {["#", "App name", "Package name", ""].map((h, i) => (
                        <th key={i} style={{
                          textAlign: i === 3 ? "center" : "left",
                          padding: "8px 16px",
                          fontSize: "10px", fontWeight: 700, color: C.textMute,
                          textTransform: "uppercase", letterSpacing: ".09em",
                          borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                          width: i === 0 ? 36 : i === 3 ? 80 : "auto",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.apps.map((a, i) =>
                      editingId === a.id ? (
                        <tr key={a.id} style={{ background: C.surfaceHov }}>
                          <td style={{ padding: "8px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                          <td style={{ padding: "6px 8px" }}>{inlineInput(editName, setEditName, () => saveEditApp(p.id), "App name", false)}</td>
                          <td style={{ padding: "6px 8px" }}>{inlineInput(editPkg, setEditPkg, () => saveEditApp(p.id), "com.example.app", true)}</td>
                          <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveEditApp(p.id)} primary />
                            <ABtn icon={<IconX />}     tip="Cancel" onClick={() => setEditingId(null)} />
                          </td>
                        </tr>
                      ) : (
                        <tr key={a.id}
                          onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHov}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          style={{ borderBottom: i < p.apps.length - 1 || addingTo === p.id ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}>
                          <td style={{ padding: "10px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: "13px", color: C.textPri }}>{a.name}</td>
                          <td style={{ padding: "10px 16px", fontFamily: C.mono, fontSize: "11.5px", color: C.textSec }}>{a.pkg}</td>
                          <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <ABtn icon={<IconPencil />} tip="Edit" onClick={() => { setEditingId(a.id); setEditName(a.name); setEditPkg(a.pkg); setAddingTo(null); }} />
                            <ABtn icon={<IconTrash />}  tip="Delete" danger
                              onClick={() => setConfirmDel({ type: "app", pid: p.id, aid: a.id, label: `Delete app "${a.name}" from "${p.name}"?` })} />
                          </td>
                        </tr>
                      )
                    )}
                    {/* Add app inline row */}
                    {addingTo === p.id && (
                      <tr style={{ background: C.surfaceHov }}>
                        <td style={{ padding: "8px 16px" }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: p.color }} />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input autoFocus placeholder="App name" value={newAppName} onChange={(e) => setNewAppName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveNewApp(p.id)}
                            style={{ fontFamily: C.font, fontSize: "13px", padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.bg, color: C.textPri, width: "100%", outline: "none", boxShadow: `0 0 0 2px ${C.primaryGlow}` }} />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input placeholder="com.example.app" value={newAppPkg} onChange={(e) => setNewAppPkg(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveNewApp(p.id)}
                            style={{ fontFamily: C.mono, fontSize: "11.5px", padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.bg, color: C.textSec, width: "100%", outline: "none", boxShadow: `0 0 0 2px ${C.primaryGlow}` }} />
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveNewApp(p.id)} primary />
                          <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setAddingTo(null); setNewAppName(""); setNewAppPkg(""); }} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Footer */}
                <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${C.border}` }}>
                  <Button size="small"
                    onClick={() => { setAddingTo(p.id); setEditingId(null); setNewAppName(""); setNewAppPkg(""); setExpanded(new Set([...expanded, p.id])); }}
                    sx={{
                      borderRadius: "8px", fontSize: "12px", fontWeight: 600, textTransform: "none",
                      color: p.color, px: 1.25, height: 28, fontFamily: C.font, gap: 0.5,
                      "&:hover": { bgcolor: `${p.color}14` },
                    }}>
                    <IconPlus />&nbsp;Add app
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Box>
        );
      })}
      </Box>

      {totalProfilePages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5, mb: 1 }}>
          <Pagination
            count={totalProfilePages}
            page={profilePage}
            onChange={(_, p) => {
              setSlideDirP(p > profilePage ? "right" : "left");
              setProfilePage(p);
            }}
            size="small"
            sx={{
              "& .MuiPaginationItem-root": { fontFamily: C.font, fontSize: "13px" },
              "& .Mui-selected": { bgcolor: C.primaryDim, color: C.primary, fontWeight: 700 }
            }}
          />
        </Box>
      )}
    </Box>
  );
}

// ── USERS & APPS TAB ─────────────────────────────────────────
function UsersAppsTab({ profiles, users, setUsers }) {
  const [selP, setSelP]       = useState(new Set());
  const [selU, setSelU]       = useState(new Set());
  const [toast, setToast]     = useState({ msg: "", ok: true });
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage]       = useState(1);
  const [slideDirU, setSlideDirU] = useState("right");
  const itemsPerPage = 5;
  const [confirmRemoveUserApp, setConfirmRemoveUserApp] = useState(null);

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  React.useEffect(() => {
    setSlideDirU("right");
    setPage(1);
  }, [userSearch]);

  const flash = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 2800);
  }, []);

  const doAssign = async () => {
    if (!selP.size || !selU.size) { flash("Select at least one profile and one user.", false); return; }
    
    let changed = 0;
    const next = users.map((u) => {
      if (!selU.has(u.id)) return u;
      const added = [...selP].filter((pid) => !u.profiles.includes(pid));
      changed += added.length;
      return { ...u, profiles: [...u.profiles, ...added] };
    });
    
    if (changed === 0) {
      flash("Already assigned — no changes");
      setSelP(new Set()); setSelU(new Set());
      return;
    }

    try {
      for (const pid of selP) {
        const p = profiles.find((x) => x.id === pid);
        if (p) {
          const pUsers = next.filter(u => u.profiles.includes(pid)).map(u => u.email);
          await updateAppProfileAPI(pid, p.name, true, p.apps, pUsers);
        }
      }
      setUsers(next);
      setSelP(new Set()); setSelU(new Set());
      flash(`${changed} assignment${changed > 1 ? "s" : ""} added`);
    } catch (e) {
      console.error("Assignment failed:", e);
      flash(`Failed to assign: ${e.message}`, false);
    }
  };

  const removeProfile = async (uid, pid) => {
    const nextUsers = users.map((u) => u.id === uid ? { ...u, profiles: u.profiles.filter((x) => x !== pid) } : u);
    
    const otherUsersHaveProfile = nextUsers.some(u => u.profiles.includes(pid));
    const p = profiles.find((x) => x.id === pid);
    if (p) {
      try {
        const pUsers = nextUsers.filter(u => u.profiles.includes(pid)).map(u => u.email);
        await updateAppProfileAPI(pid, p.name, otherUsersHaveProfile, p.apps, pUsers);
        setUsers(nextUsers);
      } catch(e) { 
        console.error("Removal failed:", e);
        flash(`Failed to remove assignment: ${e.message}`, false);
      }
    } else {
        setUsers(nextUsers);
    }
  };

  return (
    <Box>
      {/* Assign panel */}
      <Box sx={{
        bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px",
        p: 2.5, mb: 3, position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(52,211,153,0.1)", filter: "blur(30px)", pointerEvents: "none" }} />
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".09em", mb: 2, fontFamily: C.font }}>
          Assign profiles to users
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          {/* Profiles */}
          <Box>
            <Typography sx={{ fontSize: "11px", color: C.textMute, mb: 0.75, fontFamily: C.font, fontWeight: 500 }}>App profiles</Typography>
            <MultiSelect options={profiles} selected={selP} onChange={setSelP} placeholder="Select profiles…"
              renderOption={(p) => (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
                  <Box>
                    <Box sx={{ fontSize: "13px", fontWeight: 600, color: C.textPri, fontFamily: C.font }}>{p.name}</Box>
                    <Box sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font }}>{p.apps.length} app{p.apps.length !== 1 ? "s" : ""}</Box>
                  </Box>
                </Box>
              )}
            />
            {selP.size > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.625, mt: 1 }}>
                {[...selP].map((id) => { const p = profiles.find((x) => x.id === id); return p ? <Tag key={id} label={p.name} color={p.color} small onRemove={() => { const s = new Set(selP); s.delete(id); setSelP(s); }} /> : null; })}
              </Box>
            )}
          </Box>
          {/* Users */}
          <Box>
            <Typography sx={{ fontSize: "11px", color: C.textMute, mb: 0.75, fontFamily: C.font, fontWeight: 500 }}>Users</Typography>
            <MultiSelect options={users} selected={selU} onChange={setSelU} placeholder="Select users…"
              renderOption={(u) => (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 22, height: 22, bgcolor: u.color, fontSize: "9px", fontWeight: 700, fontFamily: C.font }}>{inits(u.name)}</Avatar>
                  <Box sx={{ fontSize: "13px", color: C.textPri, fontFamily: C.font, fontWeight: 500 }}>{u.name}</Box>
                </Box>
              )}
            />
            {selU.size > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.625, mt: 1 }}>
                {[...selU].map((id) => { const u = users.find((x) => x.id === id); return u ? <Tag key={id} label={u.name} color={u.color} small onRemove={() => { const s = new Set(selU); s.delete(id); setSelU(s); }} /> : null; })}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button onClick={doAssign} sx={{
            borderRadius: "10px", px: 2.5, height: 36,
            bgcolor: C.primary, color: "#fff",
            fontFamily: C.font, fontWeight: 700, fontSize: "13px", textTransform: "none",
            boxShadow: `0 4px 14px ${C.primaryGlow}`,
            "&:hover": { bgcolor: "#3a7de8" },
          }}>
            Assign
          </Button>
          <Button onClick={() => { setSelP(new Set()); setSelU(new Set()); }}
            sx={{ borderRadius: "10px", px: 2, height: 36, color: C.textSec, fontFamily: C.font, fontSize: "13px", textTransform: "none", "&:hover": { bgcolor: C.surfaceHov } }}>
            Clear
          </Button>
          {toast.msg && (
            <Typography sx={{ fontSize: "12px", fontFamily: C.font, fontWeight: 600, color: toast.ok ? C.success : C.warning, animation: "fadeIn .2s ease" }}>
              {toast.ok ? "✓" : "⚠"} {toast.msg}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Users list */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", mb: 1, fontFamily: C.font }}>
          Current assignments
        </Typography>
        <input
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            border: `1px solid ${C.border}`, background: C.surface,
            color: C.textPri, fontFamily: C.font, fontSize: "13px",
            outline: "none", width: "240px", maxWidth: "100%",
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.02)`
          }}
        />
      </Box>

      {displayedUsers.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: C.textMute, fontSize: "13px", fontFamily: C.font }}>
          No users found
        </Box>
      ) : (
        <Box key={`${page}-${slideDirU}`} sx={{ animation: `${slideDirU === "right" ? "slideInRight" : "slideInLeft"} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)` }}>
        {displayedUsers.map((u) => (
          <Box key={u.id} sx={{
            bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px",
            px: 2, py: 1.75, mb: 1,
            display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
            "&:hover": { borderColor: C.borderHov }, transition: "border-color 0.15s",
          }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: u.color, fontSize: "12px", fontWeight: 700, fontFamily: C.font, flexShrink: 0 }}>
              {inits(u.name)}
            </Avatar>
            <Box sx={{ minWidth: 140 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.textPri, fontFamily: C.font }}>{u.name}</Typography>
              <Typography sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font }}>{u.email}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.625, justifyContent: "flex-end" }}>
              {u.profiles.length === 0
                ? <Typography sx={{ fontSize: "12px", color: C.textMute, fontFamily: C.font, fontStyle: "italic" }}>No profiles assigned</Typography>
                : u.profiles.map((pid) => { const p = profiles.find((x) => x.id === pid); return p ? <Tag key={pid} label={p.name} color={p.color} small onRemove={() => setConfirmRemoveUserApp({ uid: u.id, pid, uName: u.name, pName: p.name })} /> : null; })
              }
            </Box>
            <Box sx={{
              minWidth: 28, height: 20, borderRadius: "6px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: u.profiles.length ? C.successDim : C.surfaceHov,
              border: `1px solid ${u.profiles.length ? "rgba(52,211,153,0.25)" : C.border}`,
              fontSize: "11px", fontWeight: 700, fontFamily: C.font,
              color: u.profiles.length ? C.success : C.textMute, px: 0.875,
            }}>
              {u.profiles.length}
            </Box>
          </Box>
        ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5, mb: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => {
              setSlideDirU(p > page ? "right" : "left");
              setPage(p);
            }}
            size="small"
            sx={{
              "& .MuiPaginationItem-root": { fontFamily: C.font, fontSize: "13px" }
            }}
          />
        </Box>
      )}

      {/* Remove Assignment confirmation */}
      <ConfirmDialog
        open={!!confirmRemoveUserApp}
        title="Remove Profile Assignment"
        content={confirmRemoveUserApp ? `Are you sure you want to remove the profile "${confirmRemoveUserApp.pName}" from user "${confirmRemoveUserApp.uName}"?` : ""}
        confirmText="Remove"
        onConfirm={() => {
          if (confirmRemoveUserApp) removeProfile(confirmRemoveUserApp.uid, confirmRemoveUserApp.pid);
          setConfirmRemoveUserApp(null);
        }}
        onCancel={() => setConfirmRemoveUserApp(null)}
      />
    </Box>
  );
}

// ── Exported sidebar icon ─────────────────────────────────────
export const AppProfileIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/><path d="M7 8h10M7 11h6"/>
  </svg>
);

// ── MAIN MODAL ────────────────────────────────────────────────
export default function AppProfileModal({ open, onClose, refCode }) {
  const [tab, setTab]           = useState(0);   // 0 = App Profiles, 1 = Users
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [users, setUsers]       = useState(INITIAL_USERS);
  const [loading, setLoading]   = useState(false);

  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, refCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resP = await fetchAppProfilesAPI(0, 20);
      let fetchedProfiles = [];
      if (resP && resP.statusCode === 200 && resP.data && resP.data.paginatedData) {
        fetchedProfiles = resP.data.paginatedData.map((item, index) => ({
          id: item.id,
          name: item.appProfileName,
          assigned: item.assigned || false,
          color: PROFILE_COLORS[index % PROFILE_COLORS.length],
          apps: item.appDetails ? item.appDetails.map((app) => ({
            id: app.appId,
            name: app.appName,
            pkg: app.packageName
          })) : [],
          assignedEmails: item.users || []
        }));
        setProfiles(fetchedProfiles);
      }

      let historyUsers = [];
      const uMap = new Map();

      if (refCode) {
        const d = new Date(); d.setMonth(d.getMonth() - 2);
        const sd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const ed = new Date().toISOString().split("T")[0];
        
        const params = new URLSearchParams({ referenceCode: refCode, startDate: sd, endDate: ed, page: 0, size: 10000 });
        const resU = await fetch(`http://172.31.2.91:8082/sales-team/v1/reference/history?${params}`);
        if (resU.ok) {
          const jsonU = await resU.json();
          if (jsonU.statusCode === 200 && jsonU.data?.paginatedData) {
            jsonU.data.paginatedData.forEach(row => {
              if (row.userEmail && !uMap.has(row.userEmail)) {
                const userProfiles = fetchedProfiles.filter(p => p.assignedEmails.includes(row.userEmail)).map(p => p.id);
                uMap.set(row.userEmail, {
                  id: row.userEmail,
                  name: row.userName || row.userEmail,
                  email: row.userEmail,
                  color: PROFILE_COLORS[uMap.size % PROFILE_COLORS.length],
                  profiles: userProfiles
                });
              }
            });
          }
        }
      }

      // Add any assigned users that weren't in history
      fetchedProfiles.forEach(p => {
        p.assignedEmails.forEach(email => {
          if (!uMap.has(email)) {
            uMap.set(email, {
              id: email,
              name: email,
              email: email,
              color: PROFILE_COLORS[uMap.size % PROFILE_COLORS.length],
              profiles: [p.id]
            });
          } else {
            const u = uMap.get(email);
            if (!u.profiles.includes(p.id)) u.profiles.push(p.id);
          }
        });
      });

      setUsers(Array.from(uMap.values()));

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { label: "App profiles", icon: <IconPackage /> },
    { label: "Users & apps", icon: <IconUsers />   },
  ];

  return (
    <>
      <style>{FONT_STYLE}{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: C.bg, backgroundImage: "none",
            borderRadius: "20px",
            border: `1px solid ${C.border}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
            maxHeight: "90vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
          },
        }}
        BackdropProps={{ sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(0,0,0,0.4)" } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 0, flexShrink: 0,
          background: `linear-gradient(180deg, #f0f7ff 0%, ${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Ambient glow */}
          <Box sx={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", bgcolor: C.primaryGlow, filter: "blur(60px)", opacity: 0.6, pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", top: -60, right: 40, width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(52,211,153,0.15)", filter: "blur(50px)", opacity: 0.6, pointerEvents: "none" }} />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              {/* Icon */}
              <Box sx={{
                width: 44, height: 44, borderRadius: "13px",
                background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                border: `1px solid ${C.primaryDim}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 20px ${C.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.8)`,
                color: C.primary, flexShrink: 0,
              }}>
                <IconPackage />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "17px", fontWeight: 800, color: C.textPri, fontFamily: C.font, letterSpacing: "-.02em", lineHeight: 1.2 }}>
                  App Profile Manager
                </Typography>
                <Typography sx={{ fontSize: "12px", color: C.textSec, fontFamily: C.font, mt: 0.25, display: "flex", alignItems: "center" }}>
                  {loading ? (
                    <><CircularProgress size={10} sx={{ color: C.textSec, mr: 0.75 }} /> Loading...</>
                  ) : (
                    <>{profiles.length} profile{profiles.length !== 1 ? "s" : ""} · {users.length} users</>
                  )}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{
              color: C.textSec, borderRadius: "9px", p: 0.75,
              "&:hover": { bgcolor: C.surfaceHov, color: C.textPri },
            }}>
              <IconX />
            </IconButton>
          </Box>

          {/* Tab bar */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {TABS.map((t, i) => (
              <Box key={i} onClick={() => setTab(i)} sx={{
                display: "flex", alignItems: "center", gap: 0.875,
                px: 1.875, py: 1.125, cursor: "pointer",
                borderRadius: "10px 10px 0 0",
                fontSize: "13px", fontWeight: tab === i ? 700 : 500,
                fontFamily: C.font,
                color: tab === i ? C.textPri : C.textSec,
                bgcolor: tab === i ? C.bg : "transparent",
                borderBottom: tab === i ? `2px solid ${C.primary}` : "2px solid transparent",
                boxShadow: tab === i ? `inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
                "&:hover": { color: C.textPri, bgcolor: tab === i ? C.bg : C.surfaceHov },
                transition: "all 0.15s",
              }}>
                <Box sx={{ color: tab === i ? C.primary : C.textMute, display: "flex", transition: "color 0.15s" }}>{t.icon}</Box>
                {t.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Scrollable content */}
        <DialogContent sx={{
          px: 3, py: 3, overflowY: "auto", bgcolor: C.bg, flexShrink: 1,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 3 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        }}>
          {tab === 0 && <AppProfilesTab profiles={profiles} setProfiles={setProfiles} users={users} setUsers={setUsers} />}
          {tab === 1 && <UsersAppsTab   profiles={profiles} users={users} setUsers={setUsers} />}
        </DialogContent>
      </Dialog>
    </>
  );
}