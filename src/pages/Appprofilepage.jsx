import React, { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, Box, Typography, Avatar, Chip,
  Button, TextField, IconButton, Tooltip, Collapse, Popover, Pagination,
  CircularProgress
} from "@mui/material";
import { VITE_API_BASE_URL, VITE_API_SALE_TEAM } from "../config";

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
  urlAccent:   "#7c3aed",
  urlDim:      "rgba(124,58,237,0.08)",
  textPri:     "#111827",
  textSec:     "#4b5563",
  textMute:    "#6b7280",
  mono:        "'JetBrains Mono', monospace",
  font:        "'DM Sans', 'Segoe UI', sans-serif",
};

// ── API Config ────────────────────────────────────────────────
const API_BASE_URL = VITE_API_BASE_URL;

// ── Validation helpers ────────────────────────────────────────
const PACKAGE_RE  = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){1,}$/;
const URL_RE      = /^https?:\/\/([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i;
const PROFILE_NAME_MAX  = 60;
const APP_NAME_MAX      = 80;
const URL_NAME_MAX      = 60;
const URL_VAL_MAX       = 500;
const PKG_MAX           = 200;

function validateProfileName(v) {
  const s = v.trim();
  if (!s) return "Profile name is required.";
  if (s.length < 2) return "Must be at least 2 characters.";
  if (s.length > PROFILE_NAME_MAX) return `Max ${PROFILE_NAME_MAX} characters.`;
  return "";
}
function validateAppName(v) {
  const s = v.trim();
  if (!s) return "App name is required.";
  if (s.length < 2) return "Must be at least 2 characters.";
  if (s.length > APP_NAME_MAX) return `Max ${APP_NAME_MAX} characters.`;
  return "";
}
function validatePackageName(v) {
  const s = v.trim();
  if (!s) return "Package name is required.";
  if (s.length > PKG_MAX) return `Max ${PKG_MAX} characters.`;
  if (!PACKAGE_RE.test(s)) return "Must be a valid package name (e.g. com.example.app).";
  return "";
}
function validateUrlName(v) {
  const s = v.trim();
  if (!s) return "URL label is required.";
  if (s.length < 2) return "Must be at least 2 characters.";
  if (s.length > URL_NAME_MAX) return `Max ${URL_NAME_MAX} characters.`;
  return "";
}
function validateUrlValue(v) {
  const s = v.trim();
  if (!s) return "URL is required.";
  if (s.length > URL_VAL_MAX) return `Max ${URL_VAL_MAX} characters.`;
  if (!URL_RE.test(s)) return "Must be a valid URL starting with http:// or https://.";
  return "";
}

// ── Create App Profile API call ───────────────────────────────
async function createAppProfileAPI(profileName, apps = [], urls = []) {
  const requestBody = {
    appProfileName: profileName,
    assigned: null,
    appDetails: apps.map((app) => ({
      appId:       app.id,
      appName:     app.name,
      packageName: app.pkg,
    })),
    urlDetails: urls.map((u) => ({
      urlName: u.urlName,
      url:     u.url,
    })),
  };
  const response = await fetch(`${API_BASE_URL}/app-profile`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(requestBody),
  });
  if (!response.ok) {
    let errMsg = "Unknown error";
    try { const t = await response.text(); errMsg = JSON.parse(t).message || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  return await response.json();
}

// ── Fetch App Profiles API call ───────────────────────────────
async function fetchAppProfilesAPI(page = 0, size = 20) {
  const response = await fetch(`${API_BASE_URL}/get-app-profiles?page=${page}&size=${size}`);
  if (!response.ok) {
    let errMsg = "Unknown error";
    try { const t = await response.text(); errMsg = JSON.parse(t).message || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  return await response.json();
}

// ── Update App Profile API call ───────────────────────────────
async function updateAppProfileAPI(id, profileName, assigned, apps, userEmails = [], urls = []) {
  const requestBody = {
    appProfileName: profileName,
    assigned: !!assigned,
    appDetails: apps.map((app) => ({
      appId:       app.id,
      appName:     app.name,
      packageName: app.pkg,
    })),
    urlDetails: urls.map((u) => ({
      urlName: u.urlName,
      url:     u.url,
    })),
    users: userEmails,
  };
  const response = await fetch(`${API_BASE_URL}/app-profile/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(requestBody),
  });
  if (!response.ok) {
    let errMsg = "Unknown error";
    try { const t = await response.text(); errMsg = JSON.parse(t).message || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  return await response.json();
}

// ── Delete App Profile API call ───────────────────────────────
async function deleteAppProfileAPI(id) {
  const response = await fetch(`${API_BASE_URL}/delete-app-profile`, {
    method:  "DELETE",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ appProfileId: id }),
  });
  if (!response.ok) {
    let errMsg = "Unknown error";
    try { const t = await response.text(); errMsg = JSON.parse(t).message || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  try { return await response.json(); }
  catch { return { statusCode: 200, message: "App profile is deleted successfully", status: "OK" }; }
}

// ── Assign App Profile to User API call ───────────────────────
async function assignAppProfileAPI(userId, appProfileId) {
  const response = await fetch(`${API_BASE_URL}/assign-app-profile`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ userId, appProfileId }),
  });
  if (!response.ok) {
    let errMsg = "Unknown error";
    try { const t = await response.text(); errMsg = JSON.parse(t).message || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  return await response.json();
}

// ── Initial data ──────────────────────────────────────────────
const INITIAL_PROFILES = [];
const INITIAL_USERS    = [];
const PROFILE_COLORS   = ["#4f8ef7","#34d399","#a78bfa","#fb7185","#fbbf24","#22d3ee","#f97316","#e879f9"];

// ── Helpers ───────────────────────────────────────────────────
function inits(name) {
  return name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";
}

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
const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconSmartphone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
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

// ── Inline field error ────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.375 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <Typography sx={{ fontSize: "10.5px", color: C.danger, fontFamily: C.font, lineHeight: 1.3 }}>{msg}</Typography>
    </Box>
  );
}

// ── Inline validated input (used inside table cells) ──────────
function InlineInput({ value, onChange, onEnter, placeholder, mono, autoFocus = true, error }) {
  return (
    <Box>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder={placeholder}
        style={{
          fontFamily: mono ? C.mono : C.font,
          fontSize: mono ? "11.5px" : "13px",
          padding: "6px 10px", borderRadius: 8,
          border: `1px solid ${error ? C.danger : C.primary}`,
          background: C.bg, color: mono ? C.textSec : C.textPri,
          width: "100%", outline: "none",
          boxShadow: `0 0 0 2px ${error ? "rgba(239,68,68,0.15)" : C.primaryGlow}`,
        }}
      />
      <FieldError msg={error} />
    </Box>
  );
}

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
function ABtn({ icon, tip, onClick, danger, primary, disabled }) {
  return (
    <Tooltip title={tip} placement="top">
      <span>
        <IconButton size="small" onClick={onClick} disabled={!!disabled} sx={{
          borderRadius: "8px", width: 28, height: 28,
          color: danger ? C.danger : primary ? C.primary : C.textSec,
          opacity: disabled ? 0.38 : 1,
          "&:hover": {
            bgcolor: danger ? C.dangerDim : primary ? C.primaryDim : C.surfaceHov,
            color: danger ? C.danger : primary ? C.primary : C.textPri,
          },
          transition: "all 0.15s",
        }}>{icon}</IconButton>
      </span>
    </Tooltip>
  );
}

// ── Checkbox tick ─────────────────────────────────────────────
function CheckBox({ checked, indeterminate, color }) {
  const c = color || C.primary;
  return (
    <Box sx={{
      width: 16, height: 16, borderRadius: "5px", flexShrink: 0,
      border: `1.5px solid ${checked || indeterminate ? c : C.textMute}`,
      bgcolor: checked ? c : indeterminate ? `${c}22` : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
    }}>
      {checked && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {!checked && indeterminate && (
        <Box sx={{ width: 8, height: 1.5, bgcolor: c, borderRadius: 1 }} />
      )}
    </Box>
  );
}

// ── Multi-select dropdown — with group support ────────────────
// Users with a non-null groupName are clustered under a group header row.
// Clicking the group header selects/deselects all members in one go.
// Users with no group are listed individually below grouped users.
function MultiSelect({ options, selected, onChange, placeholder, renderOption }) {
  const [anchorEl, setAnchorEl]   = useState(null);
  const [search, setSearch]       = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const open = Boolean(anchorEl);

  // ── Build structure: { grouped: Map<groupName, user[]>, ungrouped: user[] }
  const { grouped, ungrouped, flatFiltered } = React.useMemo(() => {
    const q = search.toLowerCase();
    const all = options.filter(o =>
      !q ||
      (o.name  && o.name.toLowerCase().includes(q))  ||
      (o.email && o.email.toLowerCase().includes(q)) ||
      (o.groupName && o.groupName.toLowerCase().includes(q))
    );

    const groupMap = new Map();   // groupName → user[]
    const solo     = [];

    all.forEach(u => {
      if (u.groupName) {
        if (!groupMap.has(u.groupName)) groupMap.set(u.groupName, []);
        groupMap.get(u.groupName).push(u);
      } else {
        solo.push(u);
      }
    });

    return { grouped: groupMap, ungrouped: solo, flatFiltered: all };
  }, [options, search]);

  const toggleUser = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    onChange(s);
  };

  const toggleGroup = (members) => {
    const ids    = members.map(m => m.id);
    const allSel = ids.every(id => selected.has(id));
    const s      = new Set(selected);
    allSel ? ids.forEach(id => s.delete(id)) : ids.forEach(id => s.add(id));
    onChange(s);
  };

  const toggleCollapse = (groupName, e) => {
    e.stopPropagation();
    setCollapsedGroups(prev => {
      const n = new Set(prev);
      n.has(groupName) ? n.delete(groupName) : n.add(groupName);
      return n;
    });
  };

  const groupState = (members) => {
    const ids    = members.map(m => m.id);
    const selCnt = ids.filter(id => selected.has(id)).length;
    if (selCnt === 0)          return "none";
    if (selCnt === ids.length) return "all";
    return "some";
  };

  const isEmpty = flatFiltered.length === 0;

  // Pastel accent per group (cycles through a small palette)
  const GROUP_ACCENTS = ["#4f8ef7","#34d399","#a78bfa","#fb7185","#fbbf24","#22d3ee","#f97316","#e879f9"];
  const groupAccent   = (name) => GROUP_ACCENTS[[...grouped.keys()].indexOf(name) % GROUP_ACCENTS.length];

  return (
    <Box sx={{ position: "relative" }}>
      {/* Trigger */}
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
        open={open} anchorEl={anchorEl} onClose={() => { setAnchorEl(null); setSearch(""); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: {
          mt: 0.5,
          width: anchorEl ? anchorEl.clientWidth : "auto",
          bgcolor: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column", maxHeight: 320, overflow: "hidden",
        }}}}
      >
        {/* Search bar */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${C.border}` }}>
          <input
            autoFocus placeholder="Search users or groups…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${C.border}`, background: C.bg, color: C.textPri, fontFamily: C.font, fontSize: "13px", outline: "none" }}
          />
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 2 } }}>
          {isEmpty && (
            <Box sx={{ px: 2, py: 2, fontSize: "12px", color: C.textMute, fontFamily: C.font, textAlign: "center" }}>No results found</Box>
          )}

          {/* ── Grouped users ── */}
          {[...grouped.entries()].map(([gName, members]) => {
            const state      = groupState(members);
            const accent     = groupAccent(gName);
            const isCollapsed = collapsedGroups.has(gName);
            const selCount   = members.filter(m => selected.has(m.id)).length;

            return (
              <Box key={gName}>
                {/* Group header row */}
                <Box
                  onClick={() => toggleGroup(members)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.25,
                    px: 1.5, py: 1,
                    bgcolor: `${accent}10`,
                    borderBottom: `1px solid ${C.border}`,
                    cursor: "pointer",
                    "&:hover": { bgcolor: `${accent}18` },
                    transition: "background 0.1s",
                    position: "sticky", top: 0, zIndex: 1,
                  }}
                >
                  {/* Group checkbox */}
                  <CheckBox
                    checked={state === "all"}
                    indeterminate={state === "some"}
                    color={accent}
                  />

                  {/* Group colour dot */}
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: accent, flexShrink: 0, boxShadow: `0 0 6px ${accent}88` }} />

                  <Typography sx={{ flex: 1, fontSize: "12px", fontWeight: 700, color: accent, fontFamily: C.font, letterSpacing: ".02em" }}>
                    {gName}
                  </Typography>

                  {/* Member count badge */}
                  <Box sx={{
                    px: 0.75, height: 17, borderRadius: "5px",
                    bgcolor: `${accent}20`, border: `1px solid ${accent}35`,
                    display: "flex", alignItems: "center",
                    fontSize: "10px", fontWeight: 700, color: accent, fontFamily: C.font,
                  }}>
                    {selCount}/{members.length}
                  </Box>

                  {/* Collapse chevron */}
                  <Box
                    onClick={(e) => toggleCollapse(gName, e)}
                    sx={{ color: accent, display: "flex", opacity: 0.7, "&:hover": { opacity: 1 }, ml: 0.25 }}
                  >
                    <IconChevron open={!isCollapsed} />
                  </Box>
                </Box>

                {/* Member rows */}
                {!isCollapsed && members.map((m, mi) => {
                  const isSel = selected.has(m.id);
                  return (
                    <Box key={m.id}
                      onClick={() => toggleUser(m.id)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.25,
                        pl: 3.5, pr: 1.5, py: 1,
                        cursor: "pointer",
                        borderBottom: mi < members.length - 1 ? `1px solid ${C.border}` : `1px solid ${C.border}`,
                        bgcolor: isSel ? `${accent}08` : "transparent",
                        "&:hover": { bgcolor: isSel ? `${accent}14` : C.surfaceHov },
                        transition: "background 0.1s",
                      }}
                    >
                      <CheckBox checked={isSel} color={accent} />
                      {renderOption(m)}
                    </Box>
                  );
                })}
              </Box>
            );
          })}

          {/* ── Ungrouped users ── */}
          {ungrouped.length > 0 && grouped.size > 0 && (
            <Box sx={{ px: 1.5, pt: 1, pb: 0.25 }}>
              <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: C.font }}>
                Individual
              </Typography>
            </Box>
          )}
          {ungrouped.map((u, i) => {
            const isSel = selected.has(u.id);
            return (
              <Box key={u.id}
                onClick={() => toggleUser(u.id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.25,
                  px: 1.5, py: 1.125, cursor: "pointer",
                  borderBottom: i < ungrouped.length - 1 ? `1px solid ${C.border}` : "none",
                  bgcolor: isSel ? C.primaryDim : "transparent",
                  "&:hover": { bgcolor: isSel ? C.primaryDim : C.surfaceHov },
                  transition: "background 0.1s",
                }}
              >
                <CheckBox checked={isSel} color={C.primary} />
                {renderOption(u)}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
}

// ── Single-select dropdown ────────────────────────────────────
function SingleSelect({ options, selectedId, onChange, placeholder, renderOption }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState("");
  const open = Boolean(anchorEl);
  const filtered = options.filter(o => !search || (o.name && o.name.toLowerCase().includes(search.toLowerCase())));
  const selectedOption = options.find((o) => o.id === selectedId) || null;

  return (
    <Box sx={{ position: "relative" }}>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: "10px", border: `1px solid ${open ? C.primary : C.border}`, bgcolor: C.bg, cursor: "pointer", userSelect: "none", boxShadow: open ? `0 0 0 3px ${C.primaryGlow}` : "none", transition: "all 0.15s", "&:hover": { borderColor: open ? C.primary : C.borderHov } }}>
        <Typography sx={{ fontSize: "13px", color: selectedOption ? C.textPri : C.textMute, fontFamily: C.font, fontWeight: selectedOption ? 600 : 400 }}>
          {selectedOption ? selectedOption.name : placeholder}
        </Typography>
        <Box sx={{ color: C.textMute, display: "flex" }}><IconChevron open={open} /></Box>
      </Box>
      <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, width: anchorEl ? anchorEl.clientWidth : 'auto', bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: 280, overflow: "hidden" } } }}>
        <Box sx={{ p: 1, borderBottom: `1px solid ${C.border}` }}>
          <input autoFocus placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: `1px solid ${C.border}`, background: C.bg, color: C.textPri, fontFamily: C.font, fontSize: "13px", outline: "none" }} />
        </Box>
        <Box sx={{ overflowY: "auto", flex: 1, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 2 } }}>
          {filtered.length === 0 && <Box sx={{ px: 2, py: 2, fontSize: "12px", color: C.textMute, fontFamily: C.font, textAlign: "center" }}>No results found</Box>}
          {filtered.map((opt, i) => {
            const isSel = selectedId === opt.id;
            return (
              <Box key={opt.id} onClick={() => { onChange(isSel ? null : opt.id); setAnchorEl(null); }} sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.125, cursor: "pointer", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", bgcolor: isSel ? C.primaryDim : "transparent", "&:hover": { bgcolor: isSel ? C.primaryDim : C.surfaceHov }, transition: "background 0.1s" }}>
                <Box sx={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${isSel ? C.primary : C.textMute}`, bgcolor: isSel ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {isSel && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />}
                </Box>
                {renderOption(opt)}
              </Box>
            );
          })}
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
        <Typography sx={{ fontSize: "14px", color: C.textSec, fontFamily: C.font, mb: 3, whiteSpace: "pre-line" }}>{content}</Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button onClick={onCancel} sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 600, color: C.textSec, "&:hover": { bgcolor: C.surfaceHov } }}>Cancel</Button>
          <Button onClick={onConfirm} disableElevation sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 700, bgcolor: C.danger, color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>{confirmText}</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ── Section divider with label ────────────────────────────────
function SectionLabel({ icon, label, count, accentColor }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: accentColor ? `${accentColor}06` : C.bg, borderBottom: `1px solid ${C.border}` }}>
      <Box sx={{ color: accentColor || C.textMute, display: "flex", opacity: 0.7 }}>{icon}</Box>
      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: accentColor || C.textMute, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: C.font, flex: 1 }}>{label}</Typography>
      {count !== undefined && (
        <Box sx={{ px: 0.875, height: 17, borderRadius: "5px", bgcolor: accentColor ? `${accentColor}14` : C.surfaceHov, border: `1px solid ${accentColor ? `${accentColor}25` : C.border}`, display: "flex", alignItems: "center", fontSize: "10px", fontWeight: 700, fontFamily: C.font, color: accentColor || C.textMute }}>
          {count}
        </Box>
      )}
    </Box>
  );
}

// ── APP PROFILES TAB ─────────────────────────────────────────
function AppProfilesTab({ profiles, setProfiles, users, setUsers, reloadProfiles }) {
  const [newName, setNewName]         = useState("");
  const [newNameErr, setNewNameErr]   = useState("");
  const [expanded, setExpanded]       = useState(new Set());

  // App editing state
  const [editingAppId, setEditingAppId] = useState(null);
  const [editAppName, setEditAppName]   = useState("");
  const [editAppNameErr, setEditAppNameErr] = useState("");
  const [editAppPkg, setEditAppPkg]     = useState("");
  const [editAppPkgErr, setEditAppPkgErr]   = useState("");
  const [addingAppTo, setAddingAppTo]   = useState(null);
  const [newAppName, setNewAppName]     = useState("");
  const [newAppNameErr, setNewAppNameErr] = useState("");
  const [newAppPkg, setNewAppPkg]       = useState("");
  const [newAppPkgErr, setNewAppPkgErr]   = useState("");

  // URL editing state
  const [editingUrlId, setEditingUrlId] = useState(null);
  const [editUrlName, setEditUrlName]   = useState("");
  const [editUrlNameErr, setEditUrlNameErr] = useState("");
  const [editUrlVal, setEditUrlVal]     = useState("");
  const [editUrlValErr, setEditUrlValErr]   = useState("");
  const [addingUrlTo, setAddingUrlTo]   = useState(null);
  const [newUrlName, setNewUrlName]     = useState("");
  const [newUrlNameErr, setNewUrlNameErr] = useState("");
  const [newUrlVal, setNewUrlVal]       = useState("");
  const [newUrlValErr, setNewUrlValErr]   = useState("");

  // Profile rename state
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editProfileName, setEditProfileName]   = useState("");
  const [editProfileNameErr, setEditProfileNameErr] = useState("");

  const [confirmDel, setConfirmDel] = useState(null);
  const [creating, setCreating]     = useState(false);
  const [apiToast, setApiToast]     = useState({ msg: "", type: "" });

  // Pagination & Search
  const [profileSearch, setProfileSearch] = useState("");
  const [profilePage, setProfilePage]     = useState(1);
  const [slideDirP, setSlideDirP]         = useState("right");
  const profilesPerPage = 5;

  const nextId = useRef(1);

  const filteredProfiles = profiles.filter(p =>
    !profileSearch ||
    p.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
    (p.apps || []).some(a => a.name.toLowerCase().includes(profileSearch.toLowerCase()) || a.pkg.toLowerCase().includes(profileSearch.toLowerCase())) ||
    (p.urls || []).some(u => u.urlName.toLowerCase().includes(profileSearch.toLowerCase()) || u.url.toLowerCase().includes(profileSearch.toLowerCase()))
  );
  const totalProfilePages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const displayedProfiles = filteredProfiles.slice((profilePage - 1) * profilesPerPage, profilePage * profilesPerPage);

  React.useEffect(() => { setSlideDirP("right"); setProfilePage(1); }, [profileSearch]);

  const toastColorMap = { success: C.success, error: C.danger, info: C.primary };

  const flashApiToast = (msg, type = "success") => {
    setApiToast({ msg, type });
    setTimeout(() => setApiToast({ msg: "", type: "" }), 4000);
  };

  const toggleExpand = (pid) => {
    const s = new Set(expanded);
    s.has(pid) ? s.delete(pid) : s.add(pid);
    setExpanded(s);
  };

  // ── Create profile ────────────────────────────────────────────
  const addProfile = async () => {
    const err = validateProfileName(newName);
    if (err) { setNewNameErr(err); return; }
    if (creating) return;
    const trimmedName = newName.trim();
    setCreating(true);
    setNewNameErr("");
    flashApiToast("Creating profile…", "info");
    try {
      const result = await createAppProfileAPI(trimmedName, [], []);
      setNewName("");
      flashApiToast(result.message || "App Profile created successfully.", "success");
      const refreshed = await reloadProfiles();
      if (refreshed && refreshed.length) {
        const matches = refreshed.filter((p) => p.name === trimmedName);
        const created = matches[matches.length - 1];
        if (created) setExpanded((prev) => new Set([...prev, created.id]));
      }
    } catch (err) {
      flashApiToast(`Failed to create profile: ${err.message}`, "error");
    } finally {
      setCreating(false);
    }
  };

  // ── Rename profile ────────────────────────────────────────────
  const startRenameProfile = (pid) => {
    const p = profiles.find((x) => x.id === pid);
    setEditingProfileId(pid);
    setEditProfileName(p.name);
    setEditProfileNameErr("");
  };

  const saveProfileRename = async (pid) => {
    const err = validateProfileName(editProfileName);
    if (err) { setEditProfileNameErr(err); return; }
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const originalName = p.name;
    const renamed = editProfileName.trim();
    setProfiles(profiles.map((x) => x.id === pid ? { ...x, name: renamed } : x));
    setEditingProfileId(null);
    setEditProfileNameErr("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, renamed, p.assigned, p.apps || [], pUsers, p.urls || []);
      flashApiToast("Profile renamed successfully", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id === pid ? { ...x, name: originalName } : x));
      flashApiToast(`Failed to rename: ${err.message}`, "error");
    }
  };

  // ── Delete profile ────────────────────────────────────────────
  const doDeleteProfile = async (pid) => {
    try {
      await deleteAppProfileAPI(pid);
      setProfiles(profiles.filter((x) => x.id !== pid));
      setUsers(users.map((u) => ({ ...u, profiles: u.profiles.filter((x) => x !== pid) })));
      flashApiToast("Profile deleted", "success");
    } catch (err) {
      flashApiToast(`Failed to delete: ${err.message}`, "error");
    } finally {
      setConfirmDel(null);
    }
  };

  // ── App CRUD ──────────────────────────────────────────────────
  const saveEditApp = async (pid) => {
    const nameErr = validateAppName(editAppName);
    const pkgErr  = validatePackageName(editAppPkg);
    setEditAppNameErr(nameErr);
    setEditAppPkgErr(pkgErr);
    if (nameErr || pkgErr) return;

    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newApps = (p.apps || []).map((a) => a.id !== editingAppId ? a : { ...a, name: editAppName.trim(), pkg: editAppPkg.trim() });
    const originalApps = p.apps || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setEditingAppId(null);
    setEditAppNameErr(""); setEditAppPkgErr("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers, p.urls || []);
      flashApiToast("App updated", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to update app: ${err.message}`, "error");
    }
  };

  const saveNewApp = async (pid) => {
    const nameErr = validateAppName(newAppName);
    const pkgErr  = validatePackageName(newAppPkg);
    setNewAppNameErr(nameErr);
    setNewAppPkgErr(pkgErr);
    if (nameErr || pkgErr) return;

    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const aid    = nextId.current++;
    const newApp = { id: aid, name: newAppName.trim(), pkg: newAppPkg.trim() };
    const newApps = [...(p.apps || []), newApp];
    const originalApps = p.apps || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setAddingAppTo(null); setNewAppName(""); setNewAppPkg(""); setNewAppNameErr(""); setNewAppPkgErr("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers, p.urls || []);
      flashApiToast("App added", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to add app: ${err.message}`, "error");
    }
  };

  const doDeleteApp = async (pid, aid) => {
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newApps = (p.apps || []).filter((a) => a.id !== aid);
    const originalApps = p.apps || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: newApps }));
    setConfirmDel(null);
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, newApps, pUsers, p.urls || []);
      flashApiToast("App deleted", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, apps: originalApps }));
      flashApiToast(`Failed to delete app: ${err.message}`, "error");
    }
  };

  // ── URL CRUD ──────────────────────────────────────────────────
  const saveEditUrl = async (pid) => {
    const nameErr = validateUrlName(editUrlName);
    const valErr  = validateUrlValue(editUrlVal);
    setEditUrlNameErr(nameErr);
    setEditUrlValErr(valErr);
    if (nameErr || valErr) return;

    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newUrls = (p.urls || []).map((u) => u.id !== editingUrlId ? u : { ...u, urlName: editUrlName.trim(), url: editUrlVal.trim() });
    const originalUrls = p.urls || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: newUrls }));
    setEditingUrlId(null);
    setEditUrlNameErr(""); setEditUrlValErr("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, p.apps || [], pUsers, newUrls);
      flashApiToast("URL updated", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: originalUrls }));
      flashApiToast(`Failed to update URL: ${err.message}`, "error");
    }
  };

  const saveNewUrl = async (pid) => {
    const nameErr = validateUrlName(newUrlName);
    const valErr  = validateUrlValue(newUrlVal);
    setNewUrlNameErr(nameErr);
    setNewUrlValErr(valErr);
    if (nameErr || valErr) return;

    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const uid    = `u-${nextId.current++}`;
    const newUrl = { id: uid, urlName: newUrlName.trim(), url: newUrlVal.trim() };
    const newUrls = [...(p.urls || []), newUrl];
    const originalUrls = p.urls || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: newUrls }));
    setAddingUrlTo(null); setNewUrlName(""); setNewUrlVal(""); setNewUrlNameErr(""); setNewUrlValErr("");
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, p.apps || [], pUsers, newUrls);
      flashApiToast("URL added", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: originalUrls }));
      flashApiToast(`Failed to add URL: ${err.message}`, "error");
    }
  };

  const doDeleteUrl = async (pid, uid) => {
    const p = profiles.find((x) => x.id === pid);
    if (!p) return;
    const newUrls = (p.urls || []).filter((u) => u.id !== uid);
    const originalUrls = p.urls || [];
    setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: newUrls }));
    setConfirmDel(null);
    try {
      const pUsers = users.filter(u => u.profiles.includes(pid)).map(u => u.email);
      await updateAppProfileAPI(pid, p.name, p.assigned, p.apps || [], pUsers, newUrls);
      flashApiToast("URL deleted", "success");
    } catch (err) {
      setProfiles(profiles.map((x) => x.id !== pid ? x : { ...x, urls: originalUrls }));
      flashApiToast(`Failed to delete URL: ${err.message}`, "error");
    }
  };

  // ── Shared sub-table renderer — Apps ─────────────────────────
  const renderAppTable = (p) => {
    const apps = p.apps || [];
    return (
      <>
        <SectionLabel icon={<IconSmartphone />} label="Apps" count={apps.length} accentColor={p.color} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["#", "App name", "Package name", ""].map((h, i) => (
                <th key={i} style={{ textAlign: i === 3 ? "center" : "left", padding: "7px 16px", fontSize: "10px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", width: i === 0 ? 36 : i === 3 ? 80 : "auto" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map((a, i) =>
              editingAppId === a.id ? (
                <tr key={a.id} style={{ background: C.surfaceHov }}>
                  <td style={{ padding: "8px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                    <InlineInput value={editAppName} onChange={(v) => { setEditAppName(v); setEditAppNameErr(validateAppName(v)); }} onEnter={() => saveEditApp(p.id)} placeholder="App name" error={editAppNameErr} />
                  </td>
                  <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                    <InlineInput value={editAppPkg} onChange={(v) => { setEditAppPkg(v); setEditAppPkgErr(validatePackageName(v)); }} onEnter={() => saveEditApp(p.id)} placeholder="com.example.app" mono autoFocus={false} error={editAppPkgErr} />
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveEditApp(p.id)} primary disabled={!!editAppNameErr || !!editAppPkgErr} />
                    <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setEditingAppId(null); setEditAppNameErr(""); setEditAppPkgErr(""); }} />
                  </td>
                </tr>
              ) : (
                <tr key={a.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHov}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  style={{ borderBottom: i < apps.length - 1 || addingAppTo === p.id ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}>
                  <td style={{ padding: "10px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: "13px", color: C.textPri }}>{a.name}</td>
                  <td style={{ padding: "10px 16px", fontFamily: C.mono, fontSize: "11.5px", color: C.textSec }}>{a.pkg}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <ABtn icon={<IconPencil />} tip="Edit" onClick={() => { setEditingAppId(a.id); setEditAppName(a.name); setEditAppPkg(a.pkg); setEditAppNameErr(""); setEditAppPkgErr(""); setAddingAppTo(null); setEditingUrlId(null); setAddingUrlTo(null); }} />
                    <ABtn icon={<IconTrash />}  tip="Delete" danger onClick={() => setConfirmDel({ type: "app", pid: p.id, aid: a.id, label: `Delete app "${a.name}" from "${p.name}"?` })} />
                  </td>
                </tr>
              )
            )}
            {addingAppTo === p.id && (
              <tr style={{ background: C.surfaceHov }}>
                <td style={{ padding: "8px 16px" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: p.color }} />
                </td>
                <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                  <InlineInput autoFocus value={newAppName}
                    onChange={(v) => { setNewAppName(v); setNewAppNameErr(validateAppName(v)); }}
                    onEnter={() => saveNewApp(p.id)} placeholder="App name" error={newAppNameErr} />
                </td>
                <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                  <InlineInput value={newAppPkg}
                    onChange={(v) => { setNewAppPkg(v); setNewAppPkgErr(validatePackageName(v)); }}
                    onEnter={() => saveNewApp(p.id)} placeholder="com.example.app" mono autoFocus={false} error={newAppPkgErr} />
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "top" }}>
                  <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveNewApp(p.id)} primary disabled={!!newAppNameErr || !!newAppPkgErr} />
                  <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setAddingAppTo(null); setNewAppName(""); setNewAppPkg(""); setNewAppNameErr(""); setNewAppPkgErr(""); }} />
                </td>
              </tr>
            )}
            {apps.length === 0 && addingAppTo !== p.id && (
              <tr>
                <td colSpan={4} style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", color: C.textMute, fontFamily: C.font, fontStyle: "italic" }}>
                  No apps added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Box sx={{ px: 2, py: 0.875, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <Button size="small"
            onClick={() => { setAddingAppTo(p.id); setEditingAppId(null); setAddingUrlTo(null); setEditingUrlId(null); setNewAppName(""); setNewAppPkg(""); setNewAppNameErr(""); setNewAppPkgErr(""); setExpanded(new Set([...expanded, p.id])); }}
            sx={{ borderRadius: "8px", fontSize: "12px", fontWeight: 600, textTransform: "none", color: p.color, px: 1.25, height: 28, fontFamily: C.font, gap: 0.5, "&:hover": { bgcolor: `${p.color}14` } }}>
            <IconPlus />&nbsp;Add app
          </Button>
        </Box>
      </>
    );
  };

  // ── Shared sub-table renderer — URLs ─────────────────────────
  const renderUrlTable = (p) => {
    const urls = p.urls || [];
    return (
      <>
        <SectionLabel icon={<IconLink />} label="URLs" count={urls.length} accentColor={C.urlAccent} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["#", "URL label", "URL", ""].map((h, i) => (
                <th key={i} style={{ textAlign: i === 3 ? "center" : "left", padding: "7px 16px", fontSize: "10px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", width: i === 0 ? 36 : i === 3 ? 80 : "auto" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {urls.map((u, i) =>
              editingUrlId === u.id ? (
                <tr key={u.id} style={{ background: C.surfaceHov }}>
                  <td style={{ padding: "8px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                    <InlineInput value={editUrlName} onChange={(v) => { setEditUrlName(v); setEditUrlNameErr(validateUrlName(v)); }} onEnter={() => saveEditUrl(p.id)} placeholder="Label e.g. Dashboard" error={editUrlNameErr} />
                  </td>
                  <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                    <InlineInput value={editUrlVal} onChange={(v) => { setEditUrlVal(v); setEditUrlValErr(validateUrlValue(v)); }} onEnter={() => saveEditUrl(p.id)} placeholder="https://example.com" mono autoFocus={false} error={editUrlValErr} />
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveEditUrl(p.id)} primary disabled={!!editUrlNameErr || !!editUrlValErr} />
                    <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setEditingUrlId(null); setEditUrlNameErr(""); setEditUrlValErr(""); }} />
                  </td>
                </tr>
              ) : (
                <tr key={u.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHov}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  style={{ borderBottom: i < urls.length - 1 || addingUrlTo === p.id ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}>
                  <td style={{ padding: "10px 16px", color: C.textMute, fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: "13px", color: C.textPri }}>{u.urlName}</td>
                  <td style={{ padding: "10px 16px", fontFamily: C.mono, fontSize: "11.5px", color: C.textSec, wordBreak: "break-all" }}>{u.url}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <ABtn icon={<IconPencil />} tip="Edit" onClick={() => { setEditingUrlId(u.id); setEditUrlName(u.urlName); setEditUrlVal(u.url); setEditUrlNameErr(""); setEditUrlValErr(""); setAddingUrlTo(null); setEditingAppId(null); setAddingAppTo(null); }} />
                    <ABtn icon={<IconTrash />}  tip="Delete" danger onClick={() => setConfirmDel({ type: "url", pid: p.id, uid: u.id, label: `Delete URL "${u.urlName}" from "${p.name}"?` })} />
                  </td>
                </tr>
              )
            )}
            {addingUrlTo === p.id && (
              <tr style={{ background: C.surfaceHov }}>
                <td style={{ padding: "8px 16px" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: C.urlAccent }} />
                </td>
                <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                  <InlineInput autoFocus value={newUrlName}
                    onChange={(v) => { setNewUrlName(v); setNewUrlNameErr(validateUrlName(v)); }}
                    onEnter={() => saveNewUrl(p.id)} placeholder="Label e.g. Dashboard" error={newUrlNameErr} />
                </td>
                <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                  <InlineInput value={newUrlVal}
                    onChange={(v) => { setNewUrlVal(v); setNewUrlValErr(validateUrlValue(v)); }}
                    onEnter={() => saveNewUrl(p.id)} placeholder="https://example.com" mono autoFocus={false} error={newUrlValErr} />
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap", verticalAlign: "top" }}>
                  <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveNewUrl(p.id)} primary disabled={!!newUrlNameErr || !!newUrlValErr} />
                  <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setAddingUrlTo(null); setNewUrlName(""); setNewUrlVal(""); setNewUrlNameErr(""); setNewUrlValErr(""); }} />
                </td>
              </tr>
            )}
            {urls.length === 0 && addingUrlTo !== p.id && (
              <tr>
                <td colSpan={4} style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", color: C.textMute, fontFamily: C.font, fontStyle: "italic" }}>
                  No URLs added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Box sx={{ px: 2, py: 0.875, borderTop: `1px solid ${C.border}` }}>
          <Button size="small"
            onClick={() => { setAddingUrlTo(p.id); setEditingUrlId(null); setAddingAppTo(null); setEditingAppId(null); setNewUrlName(""); setNewUrlVal(""); setNewUrlNameErr(""); setNewUrlValErr(""); setExpanded(new Set([...expanded, p.id])); }}
            sx={{ borderRadius: "8px", fontSize: "12px", fontWeight: 600, textTransform: "none", color: C.urlAccent, px: 1.25, height: 28, fontFamily: C.font, gap: 0.5, "&:hover": { bgcolor: C.urlDim } }}>
            <IconPlus />&nbsp;Add URL
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box>
      {/* Create profile card */}
      <Box sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", p: 2.5, mb: 2.5, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", bgcolor: C.primaryGlow, filter: "blur(40px)", pointerEvents: "none" }} />
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".09em", mb: 1.5, fontFamily: C.font }}>
          New profile
        </Typography>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small" fullWidth placeholder="e.g. BNT Core Suite"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (newNameErr) setNewNameErr(validateProfileName(e.target.value)); }}
              onKeyDown={(e) => e.key === "Enter" && !creating && addProfile()}
              disabled={creating}
              error={!!newNameErr}
              helperText={newNameErr}
              FormHelperTextProps={{ sx: { fontFamily: C.font, fontSize: "10.5px", ml: 0 } }}
              inputProps={{ maxLength: PROFILE_NAME_MAX + 1 }}
              sx={inputSx}
            />
          </Box>
          <Button
            onClick={addProfile}
            disabled={!newName.trim() || creating}
            sx={{
              borderRadius: "10px", px: 2.5, height: 38, whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start",
              bgcolor: newName.trim() && !creating ? C.primary : C.surfaceHov,
              color: newName.trim() && !creating ? "#fff" : C.textMute,
              border: `1px solid ${newName.trim() && !creating ? C.primary : C.border}`,
              fontFamily: C.font, fontWeight: 700, fontSize: "13px", textTransform: "none",
              boxShadow: newName.trim() && !creating ? `0 4px 12px ${C.primaryGlow}` : "none",
              "&:hover": { bgcolor: newName.trim() && !creating ? "#3a7de8" : C.surfaceHov },
              transition: "all 0.15s", display: "flex", alignItems: "center", gap: 0.75, minWidth: 110,
            }}>
            {creating ? <><CircularProgress size={12} sx={{ color: C.textMute }} />&nbsp;Creating…</> : <><IconPlus />&nbsp;Create</>}
          </Button>
        </Box>

        {apiToast.msg && (
          <Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: "9px", bgcolor: `${toastColorMap[apiToast.type]}12`, border: `1px solid ${toastColorMap[apiToast.type]}30`, display: "flex", alignItems: "center", gap: 1 }}>
            {apiToast.type === "info" && <CircularProgress size={11} sx={{ color: C.primary }} />}
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: toastColorMap[apiToast.type], fontFamily: C.font }}>
              {apiToast.type === "success" && "✓ "}{apiToast.type === "error" && "⚠ "}{apiToast.msg}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Confirm Deletion"
        content={confirmDel?.label}
        onConfirm={() => {
          if (!confirmDel) return;
          const snap = { ...confirmDel };
          setConfirmDel(null);
          if (snap.type === "profile") doDeleteProfile(snap.pid);
          else if (snap.type === "app") doDeleteApp(snap.pid, snap.aid);
          else if (snap.type === "url") doDeleteUrl(snap.pid, snap.uid);
        }}
        onCancel={() => setConfirmDel(null)}
      />

      {/* Count + search */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", mb: 1, fontFamily: C.font }}>
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
        </Typography>
        <input
          placeholder="Search profiles, apps or URLs..."
          value={profileSearch}
          onChange={(e) => setProfileSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${C.border}`, background: C.surface, color: C.textPri, fontFamily: C.font, fontSize: "13px", outline: "none", width: "260px", maxWidth: "100%", boxShadow: `inset 0 1px 2px rgba(0,0,0,0.02)` }}
        />
      </Box>

      {displayedProfiles.length === 0 && (
        <Box sx={{ textAlign: "center", py: 5, color: C.textMute, fontSize: "13px", fontFamily: C.font }}>
          {profileSearch ? "No matching profiles found" : "No profiles yet — create one above"}
        </Box>
      )}

      <Box key={`${profilePage}-${slideDirP}`} sx={{ animation: `${slideDirP === "right" ? "slideInRight" : "slideInLeft"} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)` }}>
        {displayedProfiles.map((p) => {
          const isOpen = expanded.has(p.id);
          const apps   = p.apps  || [];
          const urls   = p.urls  || [];
          return (
            <Box key={p.id} sx={{ border: `1px solid ${isOpen ? `${p.color}30` : C.border}`, borderRadius: "14px", mb: 1.25, overflow: "hidden", bgcolor: C.surface, transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: isOpen ? `0 0 0 1px ${p.color}15, 0 8px 28px rgba(0,0,0,0.08)` : "none" }}>
              {/* Header row */}
              <Box onClick={() => toggleExpand(p.id)} sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2, py: 1.625, cursor: "pointer", "&:hover": { bgcolor: C.surfaceHov }, transition: "background 0.15s" }}>
                <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: p.color, boxShadow: `0 0 8px ${p.color}88`, flexShrink: 0 }} />
                {editingProfileId === p.id ? (
                  <Box onClick={(e) => e.stopPropagation()} sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <InlineInput
                          value={editProfileName}
                          onChange={(v) => { setEditProfileName(v); setEditProfileNameErr(validateProfileName(v)); }}
                          onEnter={() => saveProfileRename(p.id)}
                          placeholder="Profile name"
                          error={editProfileNameErr}
                        />
                      </Box>
                      <ABtn icon={<IconCheck />} tip="Save"   onClick={() => saveProfileRename(p.id)} primary disabled={!!editProfileNameErr} />
                      <ABtn icon={<IconX />}     tip="Cancel" onClick={() => { setEditingProfileId(null); setEditProfileNameErr(""); }} />
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ flex: 1, fontWeight: 700, fontSize: "13.5px", color: C.textPri, fontFamily: C.font }}>{p.name}</Typography>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      <Tag label={`${apps.length} app${apps.length !== 1 ? "s" : ""}`} color={p.color} small />
                      <Tag label={`${urls.length} url${urls.length !== 1 ? "s" : ""}`} color={C.urlAccent} small />
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 0.25 }}>
                      <ABtn icon={<IconPencil />} tip="Rename" onClick={() => startRenameProfile(p.id)} />
                      <ABtn icon={<IconTrash />}  tip="Delete" danger onClick={() => setConfirmDel({ type: "profile", pid: p.id, label: `Delete "${p.name}"?\nThis will remove it from all assigned users.` })} />
                    </Box>
                    <Box sx={{ color: C.textMute, display: "flex", ml: 0.5 }}><IconChevron open={isOpen} /></Box>
                  </>
                )}
              </Box>

              {/* Expanded body */}
              <Collapse in={isOpen}>
                <Box sx={{ borderTop: `1px solid ${C.border}` }}>
                  {renderAppTable(p)}
                  {renderUrlTable(p)}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {totalProfilePages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5, mb: 1 }}>
          <Pagination count={totalProfilePages} page={profilePage}
            onChange={(_, pg) => { setSlideDirP(pg > profilePage ? "right" : "left"); setProfilePage(pg); }}
            size="small"
            sx={{ "& .MuiPaginationItem-root": { fontFamily: C.font, fontSize: "13px" }, "& .Mui-selected": { bgcolor: C.primaryDim, color: C.primary, fontWeight: 700 } }}
          />
        </Box>
      )}
    </Box>
  );
}

// ── Replace Assignment Dialog ─────────────────────────────────
// Each line is "UserName: "OldProfile" → "NewProfile""
// If more than 5 rows the list area becomes scrollable.
function ReplaceAssignmentDialog({ open, lines, onConfirm, onCancel }) {
  const VISIBLE_ROWS = 5;
  const needsScroll  = lines.length > VISIBLE_ROWS;

  // Parse each line into { user, oldProfile, newProfile }
  const parsed = lines.map((line) => {
    // Format: "UserName: "Old" → "New""
    const colonIdx = line.indexOf(":");
    const user     = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : line;
    const rest     = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : "";
    const arrow    = rest.indexOf(" → ");
    const oldP     = arrow !== -1 ? rest.slice(0, arrow).replace(/^"|"$/g, "").trim() : rest;
    const newP     = arrow !== -1 ? rest.slice(arrow + 3).replace(/^"|"$/g, "").trim() : "";
    return { user, oldP, newP };
  });

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{ sx: { borderRadius: "16px", maxWidth: 440, width: "100%", bgcolor: C.surface, backgroundImage: "none", overflow: "hidden" } }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
          {/* Warning icon + title */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
              bgcolor: C.warningDim, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.textPri, fontFamily: C.font, lineHeight: 1.25 }}>
                Replace existing assignments?
              </Typography>
              <Typography sx={{ fontSize: "12px", color: C.textSec, fontFamily: C.font, mt: 0.375 }}>
                {lines.length} user{lines.length !== 1 ? "s" : ""} already {lines.length !== 1 ? "have" : "has"} a profile assigned.
                This action will replace {lines.length !== 1 ? "them" : "it"}.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Column headers */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          px: 2.5, py: 0.875,
          bgcolor: C.bg,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}>
          {["User", "Current profile", "New profile"].map((h) => (
            <Typography key={h} sx={{ fontSize: "10px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", fontFamily: C.font }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Scrollable rows */}
        <Box sx={{
          maxHeight: needsScroll ? `${VISIBLE_ROWS * 52}px` : "none",
          overflowY: needsScroll ? "auto" : "visible",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 3 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        }}>
          {parsed.map(({ user, oldP, newP }, i) => (
            <Box key={i} sx={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              px: 2.5, py: 1.25,
              borderBottom: i < parsed.length - 1 ? `1px solid ${C.border}` : "none",
              "&:hover": { bgcolor: C.surfaceHov },
              transition: "background 0.1s",
            }}>
              {/* User */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: PROFILE_COLORS[i % PROFILE_COLORS.length], fontSize: "9px", fontWeight: 700, fontFamily: C.font, flexShrink: 0 }}>
                  {user.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: C.textPri, fontFamily: C.font, lineHeight: 1.3, wordBreak: "break-word" }}>
                  {user}
                </Typography>
              </Box>

              {/* Old profile */}
              <Box sx={{ pr: 1 }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1, py: 0.25, borderRadius: "6px",
                  bgcolor: C.dangerDim, border: `1px solid ${C.danger}28`,
                  maxWidth: "100%",
                }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: C.danger, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: C.danger, fontFamily: C.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {oldP}
                  </Typography>
                </Box>
              </Box>

              {/* Arrow + new profile */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1, py: 0.25, borderRadius: "6px",
                  bgcolor: C.successDim, border: `1px solid ${C.success}28`,
                  maxWidth: "calc(100% - 18px)",
                }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: C.success, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: C.success, fontFamily: C.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {newP}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Scroll hint */}
        {needsScroll && (
          <Box sx={{ px: 2.5, py: 0.875, bgcolor: C.bg, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 0.75 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <Typography sx={{ fontSize: "10.5px", color: C.textMute, fontFamily: C.font }}>
              Scroll to see all {lines.length} replacements
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", px: 2.5, py: 2, borderTop: `1px solid ${C.border}` }}>
          <Button
            onClick={onCancel}
            sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 600, color: C.textSec, px: 2, "&:hover": { bgcolor: C.surfaceHov } }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disableElevation
            sx={{ borderRadius: "10px", textTransform: "none", fontFamily: C.font, fontWeight: 700, bgcolor: C.warning, color: "#fff", px: 2.5, "&:hover": { bgcolor: "#c25800" } }}
          >
            Replace {lines.length > 1 ? `all ${lines.length}` : ""}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ── USERS & APPS TAB ─────────────────────────────────────────
function UsersAppsTab({ profiles, users, setUsers }) {
  const [selP, setSelP]     = useState(null);
  const [selU, setSelU]     = useState(new Set());
  const [toast, setToast]   = useState({ msg: "", ok: true });
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [slideDirU, setSlideDirU] = useState("right");
  const itemsPerPage = 5;
  const [confirmRemove, setConfirmRemove]   = useState(null);
  const [confirmReplace, setConfirmReplace] = useState(null);

  const filteredUsers  = users.filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const totalPages     = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  React.useEffect(() => { setSlideDirU("right"); setPage(1); }, [userSearch]);

  const flash = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 2800);
  }, []);

  const currentProfile = (user) => user.profiles.find((pid) => profiles.some((p) => p.id === pid)) || null;

  const doAssign = async () => {
    if (!selU.size || !selP) { flash("Select at least one user and one profile.", false); return; }
    let replacedCount = 0, addedCount = 0;
    const appAssignments = [];
    const nextUsers = users.map((u) => {
      if (!selU.has(u.id)) return u;
      const existing = currentProfile(u);
      if (existing === selP) return u;
      let newProfiles = u.profiles.filter((pid) => !profiles.some((p) => p.id === pid));
      if (existing) replacedCount++; else addedCount++;
      newProfiles = [...newProfiles, selP];
      appAssignments.push({ userId: u.userId, userEmail: u.email, userName: u.name, appProfileId: selP });
      return { ...u, profiles: newProfiles };
    });
    if (replacedCount === 0 && addedCount === 0) { flash("Already assigned — no changes"); setSelP(null); setSelU(new Set()); return; }
    const runAssign = async () => {
      try {
        for (const { userId, userEmail, userName, appProfileId } of appAssignments) {
          if (!userId) throw new Error(`Missing userId for ${userName || userEmail}`);
          await assignAppProfileAPI(userId, appProfileId);
        }
        setUsers(nextUsers); setSelP(null); setSelU(new Set());
        const total = replacedCount + addedCount;
        flash(`${total} assignment${total > 1 ? "s" : ""} updated`);
      } catch (e) { flash(`Failed to assign: ${e.message}`, false); }
    };
    if (replacedCount > 0) {
      const lines = [];
      [...selU].forEach((uid) => {
        const u = users.find((x) => x.id === uid); if (!u) return;
        const existing = currentProfile(u);
        if (existing && existing !== selP) {
          const oldP = profiles.find((x) => x.id === existing);
          const newP = profiles.find((x) => x.id === selP);
          lines.push(`${u.name}: "${oldP?.name}" → "${newP?.name}"`);
        }
      });
      setConfirmReplace({ lines, onProceed: runAssign });
    } else { await runAssign(); }
  };

  const removeProfile = async (uid, pid) => {
    const nextUsers = users.map((u) => u.id === uid ? { ...u, profiles: u.profiles.filter((x) => x !== pid) } : u);
    const p = profiles.find((x) => x.id === pid);
    if (p) {
      try {
        const pUsers = nextUsers.filter(u => u.profiles.includes(pid)).map(u => u.email);
        await updateAppProfileAPI(pid, p.name, pUsers.length > 0, p.apps || [], pUsers, p.urls || []);
        setUsers(nextUsers);
      } catch(e) { flash(`Failed to remove: ${e.message}`, false); }
    } else { setUsers(nextUsers); }
  };

  return (
    <Box>
      <Box sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", p: 2.5, mb: 3, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(52,211,153,0.1)", filter: "blur(30px)", pointerEvents: "none" }} />
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".09em", mb: 0.5, fontFamily: C.font }}>Assign profiles to users</Typography>
        <Typography sx={{ fontSize: "11.5px", color: C.textMute, mb: 2, fontFamily: C.font }}>Each user holds one profile. Assigning a new one replaces the existing.</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: "11px", color: C.textMute, mb: 0.75, fontFamily: C.font, fontWeight: 500 }}>Profile</Typography>
          <SingleSelect options={profiles} selectedId={selP} onChange={setSelP} placeholder="Select a profile…"
            renderOption={(p) => (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
                <Box>
                  <Box sx={{ fontSize: "13px", fontWeight: 600, color: C.textPri, fontFamily: C.font }}>{p.name}</Box>
                  <Box sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font, display: "flex", gap: 0.75 }}>
                    <span>{(p.apps || []).length} app{(p.apps || []).length !== 1 ? "s" : ""}</span><span>·</span><span>{(p.urls || []).length} url{(p.urls || []).length !== 1 ? "s" : ""}</span>
                  </Box>
                </Box>
              </Box>
            )}
          />
          {selP && (() => { const p = profiles.find((x) => x.id === selP); return p ? <Box sx={{ mt: 1 }}><Tag label={p.name} color={p.color} small onRemove={() => setSelP(null)} /></Box> : null; })()}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: "11px", color: C.textMute, mb: 0.75, fontFamily: C.font, fontWeight: 500 }}>Users</Typography>
          <MultiSelect options={users} selected={selU} onChange={setSelU} placeholder="Select users…"
            renderOption={(u) => (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 22, height: 22, bgcolor: u.color, fontSize: "9px", fontWeight: 700, fontFamily: C.font }}>{inits(u.name)}</Avatar>
                <Box sx={{ fontSize: "13px", color: C.textPri, fontFamily: C.font, fontWeight: 500 }}>{u.name}</Box>
              </Box>
            )}
          />
          {selU.size > 0 && (() => {
            // Build group → selected members map for compact display
            const groupSelMap = new Map();   // groupName → selectedUsers[]
            const soloSel     = [];
            [...selU].forEach(id => {
              const u = users.find(x => x.id === id);
              if (!u) return;
              if (u.groupName) {
                if (!groupSelMap.has(u.groupName)) groupSelMap.set(u.groupName, []);
                groupSelMap.get(u.groupName).push(u);
              } else {
                soloSel.push(u);
              }
            });
            const removeGroup = (members) => {
              const s = new Set(selU);
              members.forEach(m => s.delete(m.id));
              setSelU(s);
            };
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.625, mt: 1 }}>
                {/* Group chips — one per group, shows count if partial */}
                {[...groupSelMap.entries()].map(([gName, members]) => {
                  const totalInGroup = users.filter(u => u.groupName === gName).length;
                  const label = members.length === totalInGroup
                    ? gName
                    : `${gName} (${members.length}/${totalInGroup})`;
                  const accent = ["#4f8ef7","#34d399","#a78bfa","#fb7185","#fbbf24","#22d3ee","#f97316","#e879f9"][
                    [...new Set(users.filter(u => u.groupName).map(u => u.groupName))].indexOf(gName) % 8
                  ];
                  return <Tag key={gName} label={label} color={accent} small onRemove={() => removeGroup(members)} />;
                })}
                {/* Individual chips */}
                {soloSel.map(u => (
                  <Tag key={u.id} label={u.name} color={u.color} small onRemove={() => { const s = new Set(selU); s.delete(u.id); setSelU(s); }} />
                ))}
              </Box>
            );
          })()}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button onClick={doAssign} sx={{ borderRadius: "10px", px: 2.5, height: 36, bgcolor: C.primary, color: "#fff", fontFamily: C.font, fontWeight: 700, fontSize: "13px", textTransform: "none", boxShadow: `0 4px 14px ${C.primaryGlow}`, "&:hover": { bgcolor: "#3a7de8" } }}>Assign</Button>
          <Button onClick={() => { setSelP(null); setSelU(new Set()); }} sx={{ borderRadius: "10px", px: 2, height: 36, color: C.textSec, fontFamily: C.font, fontSize: "13px", textTransform: "none", "&:hover": { bgcolor: C.surfaceHov } }}>Clear</Button>
          {toast.msg && <Typography sx={{ fontSize: "12px", fontFamily: C.font, fontWeight: 600, color: toast.ok ? C.success : C.warning, animation: "fadeIn .2s ease" }}>{toast.ok ? "✓" : "⚠"} {toast.msg}</Typography>}
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: ".09em", mb: 1, fontFamily: C.font }}>Current assignments</Typography>
        <input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${C.border}`, background: C.surface, color: C.textPri, fontFamily: C.font, fontSize: "13px", outline: "none", width: "240px", maxWidth: "100%", boxShadow: `inset 0 1px 2px rgba(0,0,0,0.02)` }} />
      </Box>

      {displayedUsers.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: C.textMute, fontSize: "13px", fontFamily: C.font }}>No users found</Box>
      ) : (
        <Box key={`${page}-${slideDirU}`} sx={{ animation: `${slideDirU === "right" ? "slideInRight" : "slideInLeft"} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)` }}>
          {displayedUsers.map((u) => {
            const pid = currentProfile(u);
            const p   = pid ? profiles.find((x) => x.id === pid) : null;
            return (
              <Box key={u.id} sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", px: 2, py: 1.75, mb: 1, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", "&:hover": { borderColor: C.borderHov }, transition: "border-color 0.15s" }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: u.color, fontSize: "12px", fontWeight: 700, fontFamily: C.font, flexShrink: 0 }}>{inits(u.name)}</Avatar>
                <Box sx={{ minWidth: 140 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.textPri, fontFamily: C.font }}>{u.name}</Typography>
                  <Typography sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font }}>{u.email}</Typography>
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end", alignItems: "center" }}>
                  {p ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Box sx={{ color: C.textMute, display: "flex" }}><IconPackage /></Box>
                      <Tag label={p.name} color={p.color} small onRemove={() => setConfirmRemove({ uid: u.id, pid: p.id, uName: u.name, pName: p.name })} />
                      {(p.apps || []).length > 0 && <Typography sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font }}>{(p.apps || []).length} app{(p.apps || []).length !== 1 ? "s" : ""}</Typography>}
                      {(p.urls || []).length > 0 && <Typography sx={{ fontSize: "11px", color: C.textMute, fontFamily: C.font }}>· {(p.urls || []).length} url{(p.urls || []).length !== 1 ? "s" : ""}</Typography>}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "12px", color: C.textMute, fontFamily: C.font, fontStyle: "italic" }}>No profile assigned</Typography>
                  )}
                </Box>
                <Box sx={{ minWidth: 28, height: 20, borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: p ? C.successDim : C.surfaceHov, border: `1px solid ${p ? "rgba(52,211,153,0.25)" : C.border}`, fontSize: "11px", fontWeight: 700, fontFamily: C.font, color: p ? C.success : C.textMute, px: 0.875 }}>
                  {p ? 1 : 0}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5, mb: 1 }}>
          <Pagination count={totalPages} page={page} onChange={(_, pg) => { setSlideDirU(pg > page ? "right" : "left"); setPage(pg); }} size="small"
            sx={{ "& .MuiPaginationItem-root": { fontFamily: C.font, fontSize: "13px" } }} />
        </Box>
      )}

      <ConfirmDialog open={!!confirmRemove} title="Remove Profile Assignment"
        content={confirmRemove ? `Remove profile "${confirmRemove.pName}" from "${confirmRemove.uName}"?` : ""}
        confirmText="Remove"
        onConfirm={() => { if (confirmRemove) removeProfile(confirmRemove.uid, confirmRemove.pid); setConfirmRemove(null); }}
        onCancel={() => setConfirmRemove(null)} />

      <ReplaceAssignmentDialog
        open={!!confirmReplace}
        lines={confirmReplace?.lines || []}
        onConfirm={() => { const proceed = confirmReplace?.onProceed; setConfirmReplace(null); if (proceed) proceed(); }}
        onCancel={() => setConfirmReplace(null)}
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
  const [tab, setTab]           = useState(0);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [users, setUsers]       = useState(INITIAL_USERS);
  const [loading, setLoading]   = useState(false);

  React.useEffect(() => { if (open) loadData(); }, [open, refCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resP = await fetchAppProfilesAPI(0, 20);
      let fetchedProfiles = [];
      if (resP && resP.statusCode === 200 && resP.data?.paginatedData) {
        fetchedProfiles = resP.data.paginatedData.map((item, index) => ({
          id:    item.id,
          name:  item.appProfileName,
          assigned: item.assigned || false,
          color: PROFILE_COLORS[index % PROFILE_COLORS.length],
          apps:  item.appDetails ? item.appDetails.map((app) => ({ id: app.appId, name: app.appName, pkg: app.packageName })) : [],
          urls:  item.urlDetails ? item.urlDetails.map((u, uIdx) => ({ id: `${item.id}-u-${uIdx}`, urlName: u.urlName, url: u.url })) : [],
          assignedEmails: item.users || [],
        }));
        setProfiles(fetchedProfiles);
      }

      const uMap = new Map(), latestAt = new Map();
      if (refCode) {
        const d = new Date(); d.setMonth(d.getMonth() - 2);
        const sd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const ed = new Date().toISOString().split("T")[0];
        const params = new URLSearchParams({ referenceCode: refCode, startDate: sd, endDate: ed, page: 0, size: 10000 });
        const resU = await fetch(`${VITE_API_SALE_TEAM}/reference/history?${params}`);
        if (resU.ok) {
          const jsonU = await resU.json();
          if (jsonU.statusCode === 200 && jsonU.data?.paginatedData) {
            jsonU.data.paginatedData.forEach(row => {
              if (!row.userEmail) return;
              const rowAt = row.createdAt ? new Date(row.createdAt).getTime() : 0;
              const prevAt = latestAt.get(row.userEmail);
              if (prevAt !== undefined && rowAt <= prevAt) return;
              latestAt.set(row.userEmail, rowAt);
              const appPid = row.appProfileId ?? null;
              const existingEntry = uMap.get(row.userEmail);
              uMap.set(row.userEmail, {
                id: row.userEmail, userId: row.userId || null,
                name: row.userName || row.userEmail, email: row.userEmail,
                color: existingEntry ? existingEntry.color : PROFILE_COLORS[uMap.size % PROFILE_COLORS.length],
                profiles: [appPid].filter((pid) => pid !== null),
                groupName: row.groupName || null,
              });
            });
          }
        }
      }
      fetchedProfiles.forEach(p => {
        p.assignedEmails.forEach(email => {
          if (!uMap.has(email)) {
            uMap.set(email, { id: email, userId: null, name: email, email, color: PROFILE_COLORS[uMap.size % PROFILE_COLORS.length], profiles: [p.id] });
          } else {
            const u = uMap.get(email);
            if (!u.profiles.includes(p.id)) u.profiles.push(p.id);
          }
        });
      });
      setUsers(Array.from(uMap.values()));
      return fetchedProfiles;
    } catch (err) {
      console.error("Failed to fetch data:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { label: "App profiles", icon: <IconPackage /> },
    { label: "Users & apps",  icon: <IconUsers />  },
  ];

  return (
    <>
      <style>{FONT_STYLE}{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: C.bg, backgroundImage: "none", borderRadius: "20px", border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" } }}
        BackdropProps={{ sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(0,0,0,0.4)" } }}>

        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 0, flexShrink: 0, background: `linear-gradient(180deg, #f0f7ff 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          <Box sx={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", bgcolor: C.primaryGlow, filter: "blur(60px)", opacity: 0.6, pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", top: -60, right: 40, width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(52,211,153,0.15)", filter: "blur(50px)", opacity: 0.6, pointerEvents: "none" }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "13px", background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", border: `1px solid ${C.primaryDim}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${C.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.8)`, color: C.primary, flexShrink: 0 }}>
                <IconPackage />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "17px", fontWeight: 800, color: C.textPri, fontFamily: C.font, letterSpacing: "-.02em", lineHeight: 1.2 }}>App Profile Manager</Typography>
                <Typography sx={{ fontSize: "12px", color: C.textSec, fontFamily: C.font, mt: 0.25, display: "flex", alignItems: "center" }}>
                  {loading ? <><CircularProgress size={10} sx={{ color: C.textSec, mr: 0.75 }} /> Loading...</> : <>{profiles.length} profile{profiles.length !== 1 ? "s" : ""} · {users.length} users</>}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: C.textSec, borderRadius: "9px", p: 0.75, "&:hover": { bgcolor: C.surfaceHov, color: C.textPri } }}>
              <IconX />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {TABS.map((t, i) => (
              <Box key={i} onClick={() => setTab(i)} sx={{ display: "flex", alignItems: "center", gap: 0.875, px: 1.875, py: 1.125, cursor: "pointer", borderRadius: "10px 10px 0 0", fontSize: "13px", fontWeight: tab === i ? 700 : 500, fontFamily: C.font, color: tab === i ? C.textPri : C.textSec, bgcolor: tab === i ? C.bg : "transparent", borderBottom: tab === i ? `2px solid ${C.primary}` : "2px solid transparent", "&:hover": { color: C.textPri, bgcolor: tab === i ? C.bg : C.surfaceHov }, transition: "all 0.15s" }}>
                <Box sx={{ color: tab === i ? C.primary : C.textMute, display: "flex", transition: "color 0.15s" }}>{t.icon}</Box>
                {t.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Scrollable content */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: "auto", bgcolor: C.bg, flexShrink: 1, "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 3 }, "&::-webkit-scrollbar-track": { bgcolor: "transparent" } }}>
          {tab === 0 && <AppProfilesTab profiles={profiles} setProfiles={setProfiles} users={users} setUsers={setUsers} reloadProfiles={loadData} />}
          {tab === 1 && <UsersAppsTab   profiles={profiles} users={users} setUsers={setUsers} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
