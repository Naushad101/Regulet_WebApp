import React from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Avatar,
  Chip,
  Stack,
  alpha,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Email,
  Security,
  ExitToApp,
  Stars,
  Verified,
  LocalFireDepartment,
  Diamond,
  CheckCircle,
  Error,
  Warning,
  Info,
  Smartphone,
} from "@mui/icons-material";
import { VITE_API_BASE_URL } from "../config";
import SubscriptionCard from "./SubscriptionCard";
import DeviceCard from "./DeviceCard";
import { Container } from "@mui/material";

/* ─── Shared dark-theme tokens ────────────────────────────────────────────── */
const DARK = {
  bg: "linear-gradient(145deg, #020c1b 0%, #041428 40%, #061d36 70%, #020c1b 100%)",
  glass: "rgba(255,255,255,0.03)",
  glassBorder: "rgba(79,195,247,0.12)",
  glassHover: "rgba(79,195,247,0.07)",
  cyan: "#4fc3f7",
  blue: "#1565c0",
  textPrimary: "#e3f2fd",
  textSecondary: "rgba(179,218,255,0.55)",
  glow: "rgba(79,195,247,0.15)",
};

const profileStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes gridMove {
    0% { transform: translateY(0); }
    100% { transform: translateY(60px); }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(8deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(18px) rotate(-6deg); }
  }
  @keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scanline {
    0%   { top: -10%; }
    100% { top: 110%; }
  }
  @keyframes pulseRing {
    0%   { transform:scale(0.8); opacity:0.3; }
    100% { transform:scale(2.4); opacity:0; }
  }
`;

/* ─── Hex decorative particle ─────────────────────────────────────────────── */
const HexParticle = ({ style }) => (
  <Box
    sx={{
      position: "absolute",
      opacity: 0.05,
      background: "linear-gradient(135deg,#4fc3f7,#1565c0)",
      clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
      ...style,
    }}
  />
);

const ProfilePage = ({ userData: initialUserData, onLogout }) => {
  const BASE_URL = VITE_API_BASE_URL;

  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState(null);
  const [userData, setUserData] = React.useState(initialUserData);
  const [devices, setDevices] = React.useState(
    initialUserData?.deviceInfo || [],
  );
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") =>
    setNotification({ open: true, message, severity });

  const handleCloseNotification = (_, reason) => {
    if (reason === "clickaway") return;
    setNotification((n) => ({ ...n, open: false }));
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/user/profile?email=${encodeURIComponent(userData.emails)}&userId=${userData.userId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      if (!response.ok) throw new Error("Failed to fetch user profile");
      const result = await response.json();
      if (result.data) {
        setUserData(result.data);
        if (result.data.deviceInfo) setDevices(result.data.deviceInfo);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchDevices = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/user/profile?email=${encodeURIComponent(userData.emails)}&userId=${userData.userId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    if (!response.ok) throw new Error("Failed to fetch devices");
    const result = await response.json();
    if (result.data?.deviceInfo) {
      setDevices(result.data.deviceInfo);
    }
  } catch (error) {
    console.error("Error refreshing devices:", error);
  }
};

const fetchSubscription = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/user/profile?email=${encodeURIComponent(userData.emails)}&userId=${userData.userId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    if (!response.ok) throw new Error("Failed to fetch subscription");
    const result = await response.json();
    if (result.data) {
      // Only update subscription-related fields, leave devices untouched
      setUserData((prev) => ({
        ...prev,
        subscriptions: result.data.subscriptions,
        currentActivePlan: result.data.currentActivePlan,
        currentPlanEndsOn: result.data.currentPlanEndsOn,
      }));
    }
  } catch (error) {
    console.error("Error refreshing subscription:", error);
  }
};

  // React.useEffect(() => {
  //   if (initialUserData?.emails && initialUserData?.userId) fetchUserProfile();
  // }, []);

  /* ── Device logout ──────────────────────────────────────────────────────── */
  const handleLogoutDevice = async (deviceId) => {
    try {
      if (userData.accPartStatus === "APPROVED") {
        const payload = {
          userId: userData.userId,
          deviceId,
          userName: userData.fullName,
          userEmail: userData.emails,
          accPartName: userData.accPartName,
          accPartEmail: userData.accPartEmail,
          requestType: "Signout",
          reason: "Request to replace existing Account Partner with a new one",
        };
        const response = await fetch(`${BASE_URL}/sendrequestemail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok)
          throw new Error("Failed to send logout request email");
        setLogoutConfirmOpen(false);
        showNotification(
          "Logout request sent successfully. Your account partner will be notified.",
          "success",
        );
        await fetchUserProfile();
      } else {
        const payload = { userId: userData.userId, deviceId, source: "web" };
        const response = await fetch(`${BASE_URL}/signout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to sign out device");
        showNotification("Device signed out successfully", "success");
        await fetchUserProfile();
      }
    } catch (error) {
      console.error("Error:", error);
      setLogoutConfirmOpen(false);
      showNotification(
        "Something went wrong while processing logout request",
        "error",
      );
    }
  };

  const handleLogoutClick = (deviceId) => {
    if (userData.accPartStatus === "APPROVED") {
      setSelectedDeviceId(deviceId);
      setLogoutConfirmOpen(true);
    } else handleLogoutDevice(deviceId);
  };
  const handleConfirmLogout = () => {
    if (selectedDeviceId) handleLogoutDevice(selectedDeviceId);
  };
  const handleCancelLogout = () => {
    setLogoutConfirmOpen(false);
    setSelectedDeviceId(null);
  };
  const handleLogoutAll = async () => {
    try {
      const payload = { userId: userData.userId, deviceId: "", source: "web" };
      const response = await fetch(`${BASE_URL}/signout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to sign out");
      const result = await response.json();
      showNotification(
        result.message || "You have signed out successfully.",
        "success",
      );
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      showNotification("Something went wrong while signing out.", "error");
    }
  };

  const getPlanTheme = (plan) => {
    const base = {
      primary: "#4fc3f7",
      secondary: "#1565c0",
      gradient: "linear-gradient(135deg,#1565c0 0%,#4fc3f7 100%)",
      cardAccent: "linear-gradient(135deg,#4fc3f7 0%,#1976d2 100%)",
      glow: "rgba(79,195,247,0.25)",
      icon: Stars,
    };
    const map = {
      pro: { ...base, icon: LocalFireDepartment },
      premium: { ...base, icon: Diamond },
      family: { ...base, icon: Diamond },
      enterprise: { ...base, icon: Verified },
    };
    return map[plan?.toLowerCase()] || base;
  };

  if (!userData)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: DARK.bg,
        }}
      >
        <Typography
          sx={{ color: DARK.textPrimary, fontFamily: "'DM Sans',sans-serif" }}
        >
          Loading...
        </Typography>
      </Box>
    );

  const theme = getPlanTheme(userData.currentActivePlan);
  const PlanIcon = theme.icon;

  return (
    <>
      <style>{profileStyles}</style>

      <Box
        sx={{
          minHeight: "100vh",
          background: DARK.bg,
          position: "relative",
          overflow: "hidden",
          py: { xs: 2, md: 3 },
          px: { xs: 1.5, md: 2 },
        }}
      >
        {/* ── Animated grid ── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `
            linear-gradient(rgba(79,195,247,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(79,195,247,0.04) 1px,transparent 1px)
          `,
            backgroundSize: "60px 60px",
            animation: "gridMove 8s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* ── Glow blobs ── */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(21,101,192,0.2) 0%,transparent 70%)",
            filter: "blur(50px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(79,195,247,0.12) 0%,transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* ── Hex particles ── */}
        <HexParticle
          style={{
            top: "5%",
            left: "3%",
            width: 80,
            height: 80,
            animation: "floatA 7s ease-in-out infinite",
          }}
        />
        <HexParticle
          style={{
            top: "15%",
            right: "4%",
            width: 55,
            height: 55,
            animation: "floatB 9s ease-in-out infinite",
          }}
        />
        <HexParticle
          style={{
            bottom: "20%",
            left: "6%",
            width: 40,
            height: 40,
            animation: "floatA 11s ease-in-out infinite 2s",
          }}
        />
        <HexParticle
          style={{
            bottom: "8%",
            right: "10%",
            width: 70,
            height: 70,
            animation: "floatB 8s ease-in-out infinite 1s",
          }}
        />

        {/* ── Scanning line ── */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            zIndex: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(79,195,247,0.25),transparent)",
            animation: "scanline 8s linear infinite",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          {/* ═══════════════════════════════════════════════════════════════════
              HEADER CARD
          ═══════════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              mb: { xs: 2, md: 3 },
              background: DARK.glass,
              border: `1px solid ${DARK.glassBorder}`,
              borderRadius: "20px",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
              overflow: "hidden",
              animation: "fadeUp 0.6s ease forwards",
            }}
          >
            {/* Top accent line */}
            <Box
              sx={{
                height: 2,
                background:
                  "linear-gradient(90deg,transparent,#4fc3f7 40%,#1565c0 70%,transparent)",
              }}
            />

            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              {/* On mobile: stack vertically. On sm+: row */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.5, sm: 2 }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                {/* ── Avatar + Name ── */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    {/* Pulse ring behind avatar */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        border: "1px solid rgba(79,195,247,0.2)",
                        transform: "translate(-50%,-50%)",
                        animation: "pulseRing 2.5s ease-out infinite",
                      }}
                    />
                    <Avatar
                      sx={{
                        width: { xs: 46, sm: 56 },
                        height: { xs: 46, sm: 56 },
                        background:
                          "linear-gradient(135deg,#1565c0 0%,#4fc3f7 100%)",
                        fontSize: { xs: "1.1rem", sm: "1.4rem" },
                        fontWeight: 700,
                        fontFamily: "'Syne',sans-serif",
                        boxShadow: "0 8px 24px rgba(79,195,247,0.35)",
                        border: "2px solid rgba(79,195,247,0.3)",
                        zIndex: 1,
                        position: "relative",
                      }}
                    >
                      {userData.fullName?.charAt(0)}
                    </Avatar>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        background: "linear-gradient(135deg,#43a047,#66bb6a)",
                        borderRadius: "50%",
                        p: 0.3,
                        border: "2px solid rgba(2,12,27,0.8)",
                        boxShadow: "0 2px 8px rgba(76,175,80,0.5)",
                        zIndex: 2,
                      }}
                    >
                      <Verified sx={{ fontSize: 12, color: "white" }} />
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.2rem" },
                        background: "linear-gradient(-135deg,#e3f2fd 0%,#4fc3f7 50%,#1976d2 100%)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        animation: "shimmer 4s linear infinite",
                        mb: 0.3,
                      }}
                    >
                      {userData.fullName}
                    </Typography>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <Email
                        sx={{ fontSize: 13, color: "rgba(79,195,247,0.6)" }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: { xs: "0.72rem", sm: "0.8rem" },
                          color: DARK.textSecondary,
                          // Truncate long emails on mobile
                          maxWidth: { xs: "180px", sm: "unset" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {userData.emails}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {/* ── Chips + Logout ── */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{
                    gap: 1,
                    // On mobile, align to start and add a slight left offset to align with content
                    pl: { xs: 0, sm: 0 },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {/* Accountability partner */}
                  {userData.accPartStatus === "APPROVED" && (
                    <Box
                      sx={{
                        background: "rgba(79,195,247,0.06)",
                        borderRadius: "12px",
                        px: { xs: 1, sm: 1.5 },
                        py: 0.75,
                        border: "1px solid rgba(79,195,247,0.18)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        // On mobile, take full width for readability
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Security
                        sx={{ fontSize: 16, color: "#4fc3f7", flexShrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: "0.85rem",
                            color: "rgba(179,218,255,0.5)",
                            lineHeight: 1.2,
                          }}
                        >
                          Accountability Partner
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            color: DARK.textPrimary,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {userData.accPartName}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: "0.72rem",
                            color: DARK.textSecondary,
                            lineHeight: 1.1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {userData.accPartEmail}
                        </Typography>
                      </Box>
                      <Chip
                        label={userData.accPartStatus}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          flexShrink: 0,
                          background: "linear-gradient(135deg,#43a047,#66bb6a)",
                          color: "white",
                        }}
                      />
                    </Box>
                  )}

                  {/* Plan chip + Devices chip + Logout — row on mobile too */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ gap: 1 }}
                  >
                    {/* Plan chip */}
                    <Chip
                      icon={
                        <PlanIcon
                          sx={{ fontSize: 14, color: "#4fc3f7 !important" }}
                        />
                      }
                      label={userData.currentActivePlan?.toUpperCase()}
                      size="small"
                      sx={{
                        background: "rgba(79,195,247,0.1)",
                        border: "1px solid rgba(79,195,247,0.3)",
                        color: DARK.textPrimary,
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 700,
                        height: 30,
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        boxShadow: "0 4px 14px rgba(79,195,247,0.2)",
                      }}
                    />

                    {/* Devices chip */}
                    <Chip
                      icon={
                        <Smartphone
                          sx={{
                            fontSize: 14,
                            color:
                              userData.deviceLimit != null &&
                              devices.length >= userData.deviceLimit
                                ? "#ff6b6b !important"
                                : "#4fc3f7 !important",
                          }}
                        />
                      }
                      label={`${devices.length} / ${userData.deviceLimit ?? "?"} Devices`}
                      size="small"
                      sx={{
                        background:
                          userData.deviceLimit != null &&
                          devices.length >= userData.deviceLimit
                            ? "rgba(255,107,107,0.1)"
                            : "rgba(79,195,247,0.1)",
                        border: `1px solid ${
                          userData.deviceLimit != null &&
                          devices.length >= userData.deviceLimit
                            ? "rgba(255,107,107,0.3)"
                            : "rgba(79,195,247,0.3)"
                        }`,
                        color: DARK.textPrimary,
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 600,
                        height: 30,
                        fontSize: "0.72rem",
                      }}
                    />

                    {/* Logout button */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ExitToApp sx={{ fontSize: 14 }} />}
                      onClick={handleLogoutAll}
                      sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: 0.8,
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        textTransform: "none",
                        borderRadius: "10px",
                        background: "rgba(255,107,107,0.12)",
                        border: "1px solid rgba(255,107,107,0.3)",
                        color: "#ff6b6b",
                        boxShadow: "none",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          background: "rgba(255,107,107,0.22)",
                          border: "1px solid rgba(255,107,107,0.5)",
                          boxShadow: "0 4px 16px rgba(255,107,107,0.2)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.25s ease",
                      }}
                    >
                      Logout
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* ═══════════════════════════════════════════════════════════════════
              SUBSCRIPTION + DEVICES ROW
          ═══════════════════════════════════════════════════════════════════ */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "25%" },
                animation: "fadeUp 0.7s ease forwards 0.1s",
                opacity: 0,
              }}
            >
              <SubscriptionCardDark
                userData={userData}
                theme={theme}
                showNotification={showNotification}
                onProfileRefresh={fetchUserProfile}
                onRefresh={fetchSubscription}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                animation: "fadeUp 0.7s ease forwards 0.2s",
                opacity: 0,
              }}
            >
              <DeviceCardDark
                devices={devices}
                userData={userData}
                theme={theme}
                onLogoutClick={handleLogoutClick}
                onRefresh={fetchDevices}
              />
            </Box>
          </Stack>
        </Container>

        {/* ── Notification ── */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 2 }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            icon={
              notification.severity === "success" ? (
                <CheckCircle />
              ) : notification.severity === "error" ? (
                <Error />
              ) : notification.severity === "warning" ? (
                <Warning />
              ) : (
                <Info />
              )
            }
            sx={{
              width: "100%",
              minWidth: { xs: "calc(100vw - 32px)", sm: 300 },
              maxWidth: 500,
              background:
                notification.severity === "success"
                  ? "rgba(46,125,50,0.95)"
                  : notification.severity === "error"
                    ? "rgba(183,28,28,0.95)"
                    : notification.severity === "warning"
                      ? "rgba(230,81,0,0.95)"
                      : "rgba(21,101,192,0.95)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${
                notification.severity === "success"
                  ? "rgba(76,175,80,0.4)"
                  : notification.severity === "error"
                    ? "rgba(244,67,54,0.4)"
                    : notification.severity === "warning"
                      ? "rgba(255,152,0,0.4)"
                      : "rgba(79,195,247,0.4)"
              }`,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              fontFamily: "'DM Sans',sans-serif",
              "& .MuiAlert-message": { fontSize: "0.88rem", fontWeight: 500 },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* ── Device Logout Confirmation Dialog ── */}
        <Dialog
          open={logoutConfirmOpen}
          onClose={handleCancelLogout}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "18px",
              background: "rgba(4,20,40,0.97)",
              border: "1px solid rgba(255,107,107,0.5)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,107,0.2), 0 0 24px rgba(255,107,107,0.15)",
              mx: { xs: 2, sm: "auto" },
            },
          }}
        >
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,107,107,0.12)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(255,107,107,0.2)",
                }}
              >
                <ExitToApp sx={{ fontSize: 26, color: "#ff6b6b" }} />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: DARK.textPrimary,
                    mb: 0.75,
                  }}
                >
                  Logout Device?
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.85rem",
                    color: DARK.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  A logout request will be sent to your account partner{" "}
                  <Box
                    component="span"
                    sx={{ color: DARK.textPrimary, fontWeight: 600 }}
                  >
                    {userData.accPartName}
                  </Box>{" "}
                  for approval.
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ width: "100%", mt: 0.5 }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCancelLogout}
                  sx={{
                    py: 1,
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "10px",
                    borderColor: "rgba(79,195,247,0.25)",
                    color: DARK.textSecondary,
                    "&:hover": {
                      borderColor: "rgba(79,195,247,0.4)",
                      background: "rgba(79,195,247,0.05)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleConfirmLogout}
                  sx={{
                    py: 1,
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "10px",
                    background: "rgba(255,107,107,0.15)",
                    border: "1px solid rgba(255,107,107,0.35)",
                    color: "#ff6b6b",
                    boxShadow: "none",
                    "&:hover": {
                      background: "rgba(255,107,107,0.25)",
                      boxShadow: "0 4px 16px rgba(255,107,107,0.2)",
                    },
                  }}
                >
                  Send Request
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default ProfilePage;

/* ═══════════════════════════════════════════════════════════════════════════
   DARK-THEMED SubscriptionCard WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
import SubscriptionCardOriginal from "./SubscriptionCard";

const SubscriptionCardDark = (props) => (
  <Box
    sx={{
      background: DARK.glass,
      border: `1px solid ${DARK.glassBorder}`,
      borderRadius: "18px",
      backdropFilter: "blur(20px)",
      boxShadow:
        "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
      overflow: "hidden",
      height: "100%",
      "& .MuiCard-root": {
        background: "transparent !important",
        boxShadow: "none !important",
        backdropFilter: "none !important",
        border: "none !important",
        "&:hover": {
          transform: "none !important",
          boxShadow: "none !important",
        },
      },
      "& .MuiTypography-root": {
        color: `${DARK.textPrimary} !important`,
      },
      "& .MuiTypography-root[class*='secondary']": {
        color: `${DARK.textSecondary} !important`,
      },
      "& .MuiLinearProgress-root": {
        background: "rgba(79,195,247,0.08) !important",
      },
      "& .MuiLinearProgress-bar": {
        background: "linear-gradient(90deg,#1565c0,#4fc3f7) !important",
      },
      "& [style*='linear-gradient(135deg']": {
        background: "rgba(79,195,247,0.06) !important",
      },
    }}
  >
    <SubscriptionCardOriginal {...props} />
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   DARK-THEMED DeviceCard WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
import DeviceCardOriginal from "./DeviceCard";

const DeviceCardDark = (props) => (
  <Box
    sx={{
      background: DARK.glass,
      border: `1px solid ${DARK.glassBorder}`,
      borderRadius: "18px",
      backdropFilter: "blur(20px)",
      boxShadow:
        "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
      overflow: "hidden",
      height: "100%",
      "& .MuiCard-root": {
        background: "transparent !important",
        boxShadow: "none !important",
        backdropFilter: "none !important",
        border: "none !important",
        "&:hover": {
          transform: "none !important",
          boxShadow: "none !important",
        },
      },
      "& .MuiTypography-root": {
        color: `${DARK.textPrimary} !important`,
      },
      "& .MuiTypography-colorTextSecondary, & .MuiTypography-root[class*='secondary']":
        {
          color: `${DARK.textSecondary} !important`,
        },
      "& .MuiBox-root[style*='border']": {
        borderColor: "rgba(79,195,247,0.15) !important",
        background: "rgba(79,195,247,0.04) !important",
        "&:hover": {
          borderColor: "rgba(79,195,247,0.35) !important",
          boxShadow: "0 4px 20px rgba(79,195,247,0.12) !important",
        },
      },
    }}
  >
    <DeviceCardOriginal {...props} />
  </Box>
);
