import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { VITE_API_BASE_URL } from "../config";

// Animated floating hex particle
const HexParticle = ({ style }) => (
  <Box
    sx={{
      position: "absolute",
      width: "60px",
      height: "60px",
      opacity: 0.06,
      background: "linear-gradient(135deg, #4fc3f7, #1565c0)",
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      ...style,
    }}
  />
);

export default function SignInPage({ onSignInSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldReady, setFieldReady] = useState({
    email: false,
    password: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFieldReady({ email: true, password: true });
      setMounted(true);
    }, 100);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${VITE_API_BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userId: "",
          deviceInfo: {
            deviceId: "abc",
            manufacturer: "Dell",
            model: "Galaxy S23",
            osName: "Android",
            osVersion: "13",
            androidId: "abc123",
            appVersion: "1.0.0",
            source: "web",
            loginAt: "2026-01-12T15:30:00",
          },
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) throw new Error(data.message || "Sign in failed");

      setSuccess("Sign in successful! Redirecting...");
      setTimeout(() => {
        onSignInSuccess(data.data);
      }, 1000);
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#e8f4fd",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderRadius: "10px",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "rgba(79,195,247,0.2)",
        borderWidth: "1.5px",
      },
      "&:hover fieldset": { borderColor: "rgba(79,195,247,0.5)" },
      "&.Mui-focused fieldset": {
        borderColor: "#4fc3f7",
        boxShadow: "0 0 0 3px rgba(79,195,247,0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(200,230,255,0.6)",
      fontFamily: "'DM Sans', sans-serif",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4fc3f7" },
    "& .MuiFormLabel-asterisk": { color: "#ef5350" },
    "& input": {
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8f4fd",
    },

    // ✅ Fix Chrome autofill white background & text color
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #061d36 inset !important",
      WebkitTextFillColor: "#e8f4fd !important",
      caretColor: "#e8f4fd",
      borderRadius: "10px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:hover": {
      WebkitBoxShadow: "0 0 0 1000px #061d36 inset !important",
      WebkitTextFillColor: "#e8f4fd !important",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 1000px #061d36 inset !important",
      WebkitTextFillColor: "#e8f4fd !important",
    },
    "& input:-webkit-autofill:active": {
      WebkitBoxShadow: "0 0 0 1000px #061d36 inset !important",
      WebkitTextFillColor: "#e8f4fd !important",
    },
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(25px) rotate(-8deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(15px) rotate(-5deg); }
        }
        @keyframes pulseRing {
          0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        @keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) drop-shadow(0 20px 40px rgba(21,101,192,0.6)); }
          50% { transform: translateY(-8px) drop-shadow(0 28px 50px rgba(79,195,247,0.5)); }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
      `}</style>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #020c1b 0%, #041428 40%, #061d36 70%, #020c1b 100%)",
        }}
      >
        {/* ── Animated grid background ── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(79,195,247,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(79,195,247,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridMove 8s linear infinite",
          }}
        />

        {/* ── Radial glow blobs ── */}
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(21,101,192,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            right: "8%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79,195,247,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "60%",
            left: "50%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(100,181,246,0.08) 0%, transparent 70%)",
            filter: "blur(30px)",
            zIndex: 0,
          }}
        />

        {/* ── Floating hex particles ── */}
        <HexParticle
          style={{
            top: "8%",
            left: "5%",
            width: 80,
            height: 80,
            animation: "floatA 7s ease-in-out infinite",
          }}
        />
        <HexParticle
          style={{
            top: "20%",
            right: "6%",
            width: 50,
            height: 50,
            animation: "floatB 9s ease-in-out infinite",
          }}
        />
        <HexParticle
          style={{
            bottom: "25%",
            left: "8%",
            width: 40,
            height: 40,
            animation: "floatC 11s ease-in-out infinite",
          }}
        />
        <HexParticle
          style={{
            bottom: "10%",
            right: "12%",
            width: 70,
            height: 70,
            animation: "floatA 8s ease-in-out infinite 2s",
          }}
        />
        <HexParticle
          style={{
            top: "45%",
            left: "3%",
            width: 35,
            height: 35,
            animation: "floatB 6s ease-in-out infinite 1s",
          }}
        />
        <HexParticle
          style={{
            top: "70%",
            right: "4%",
            width: 55,
            height: 55,
            animation: "floatC 10s ease-in-out infinite 3s",
          }}
        />

        {/* ── Scanning line effect ── */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            zIndex: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(79,195,247,0.3), transparent)",
            animation: "scanline 6s linear infinite",
          }}
        />

        {/* ── Pulse rings (behind logo area) ── */}
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            zIndex: 0,
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "1px solid rgba(79,195,247,0.15)",
              top: "50%",
              left: "50%",
              animation: "pulseRing 3s ease-out infinite",
            },
            "&::after": { animationDelay: "1.5s" },
          }}
        />

        {/* ── Main layout: split left brand / right form ── */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            zIndex: 2,
            flexDirection: { xs: "column", md: "row" },
            // On mobile, allow scrolling if content overflows
            overflowY: { xs: "auto", md: "hidden" },
          }}
        >
          {/* ── LEFT: Branding panel ── */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              // On mobile: compact top section with row layout for logo + brand name
              p: { xs: "24px 16px 16px", md: 6 },
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.8s ease",
              // On mobile: reduce to a compact header strip
              minHeight: { xs: "auto", md: "100vh" },
            }}
          >
            {/* Mobile: horizontal layout (logo + text side by side), Desktop: vertical */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: "center",
                gap: { xs: 2, md: 0 },
                width: "100%",
                justifyContent: { xs: "center", md: "center" },
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  mb: { xs: 0, md: 3 },
                  filter: "drop-shadow(0 20px 40px rgba(21,101,192,0.6))",
                  animation: "logoFloat 4s ease-in-out infinite",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/regula_icon.png"
                  alt="Regula"
                  style={{
                    width: "clamp(56px, 12vw, 130px)",
                    height: "clamp(56px, 12vw, 130px)",
                    objectFit: "contain",
                  }}
                />
              </Box>

              {/* Brand name + subtitle */}
              <Box sx={{ textAlign: { xs: "left", md: "center" } }}>
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.8rem" },
                    letterSpacing: "-0.02em",
                    background: "linear-gradient(-135deg, #e3f2fd 0%, #4fc3f7 40%, #1976d2 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 4s linear infinite",
                    mb: { xs: 0.25, md: 1 },
                    lineHeight: 1.1,
                  }}
                >
                  REGULET
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "rgba(179,218,255,0.55)",
                    fontSize: { xs: "0.65rem", md: "0.85rem" },
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    mb: { xs: 0, md: 4 },
                  }}
                >
                  Digital Discipline, Done Right.
                </Typography>
              </Box>
            </Box>

            {/* Feature pills — hidden on mobile to save space */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                mt: 2,
              }}
            >
              {["App & URL Blocking", "Stay Focused", "100% Secure"].map(
                (f, i) => (
                  <Box
                    key={f}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                      opacity: mounted ? 1 : 0,
                      animation: mounted
                        ? `fadeSlideUp 0.6s ease forwards ${0.4 + i * 0.15}s`
                        : "none",
                      animationFillMode: "backwards",
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4fc3f7, #1976d2)",
                        boxShadow: "0 0 8px rgba(79,195,247,0.6)",
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: "rgba(179,218,255,0.6)",
                        fontSize: "0.82rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {f}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>

            {/* Mobile-only: compact feature pills in a row */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                mt: 1.5,
              }}
            >
              {[
                "App & URL Blocking",
                "Device Management",
                "Real-time Monitoring",
              ].map((f) => (
                <Box
                  key={f}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: "20px",
                    border: "1px solid rgba(79,195,247,0.15)",
                    background: "rgba(79,195,247,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4fc3f7, #1976d2)",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "rgba(179,218,255,0.55)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Vertical divider (desktop only) ── */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, rgba(79,195,247,0.2) 30%, rgba(79,195,247,0.2) 70%, transparent)",
              my: 6,
            }}
          />

          {/* ── Horizontal divider (mobile only) ── */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              height: "1px",
              mx: 3,
              background:
                "linear-gradient(to right, transparent, rgba(79,195,247,0.2) 30%, rgba(79,195,247,0.2) 70%, transparent)",
            }}
          />

          {/* ── RIGHT: Login form ── */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "center",
              p: { xs: "20px 16px 32px", md: 6 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 400, md: 400 },
                opacity: mounted ? 1 : 0,
                animation: mounted
                  ? "fadeSlideUp 0.7s ease forwards 0.2s"
                  : "none",
                animationFillMode: "backwards",
              }}
            >
              {/* Form card */}
              <Box
                sx={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(79,195,247,0.12)",
                  borderRadius: "20px",
                  p: { xs: "20px 16px", md: 4 },
                  backdropFilter: "blur(20px)",
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "1.3rem", md: "1.6rem" },
                    color: "#e3f2fd",
                    mb: 0.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Welcome!
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "rgba(179,218,255,0.45)",
                    fontSize: { xs: "0.8rem", md: "0.85rem" },
                    mb: 3,
                  }}
                >
                  Sign in to your account to continue
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: "10px",
                      background: "rgba(211,47,47,0.12)",
                      border: "1px solid rgba(211,47,47,0.3)",
                      color: "#ef9a9a",
                      fontFamily: "'DM Sans', sans-serif",
                      "& .MuiAlert-icon": { color: "#ef9a9a" },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: 2,
                      borderRadius: "10px",
                      background: "rgba(46,125,50,0.12)",
                      border: "1px solid rgba(46,125,50,0.3)",
                      color: "#a5d6a7",
                      fontFamily: "'DM Sans', sans-serif",
                      "& .MuiAlert-icon": { color: "#a5d6a7" },
                    }}
                  >
                    {success}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  autoComplete="off"
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    id="user-email-input"
                    autoComplete="nope"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() =>
                      setFieldReady((p) => ({ ...p, email: true }))
                    }
                    disabled={loading}
                    inputProps={{
                      readOnly: !fieldReady.email,
                      autoComplete: "nope",
                    }}
                    sx={inputSx}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="user-password-input"
                    autoComplete="nope"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() =>
                      setFieldReady((p) => ({ ...p, password: true }))
                    }
                    disabled={loading}
                    inputProps={{
                      readOnly: !fieldReady.password,
                      autoComplete: "nope",
                    }}
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                            sx={{
                              color: "rgba(179,218,255,0.5)",
                              "&:hover": { color: "#4fc3f7" },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 1,
                      py: { xs: 1.2, md: 1.4 },
                      borderRadius: "10px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      letterSpacing: "0.03em",
                      textTransform: "none",
                      background: loading
                        ? "rgba(79,195,247,0.3)"
                        : "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
                      backgroundSize: "200% auto",
                      boxShadow: "0 8px 24px rgba(21,101,192,0.45)",
                      transition: "all 0.3s ease",
                      "&:hover:not(:disabled)": {
                        backgroundPosition: "right center",
                        boxShadow: "0 12px 32px rgba(21,101,192,0.6)",
                        transform: "translateY(-1px)",
                      },
                      "&:active": { transform: "translateY(0)" },
                      "&.Mui-disabled": { color: "rgba(179,218,255,0.4)" },
                    }}
                  >
                    {loading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "2px solid rgba(179,218,255,0.3)",
                            borderTopColor: "#4fc3f7",
                            animation: "spin 0.8s linear infinite",
                            "@keyframes spin": {
                              to: { transform: "rotate(360deg)" },
                            },
                          }}
                        />
                        Signing In...
                      </Box>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </Box>
              </Box>

              {/* Footer */}
              <Typography
                sx={{
                  textAlign: "center",
                  mt: 2.5,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(179,218,255,0.25)",
                  fontSize: "0.75rem",
                }}
              >
                © 2026 BNT Soft · Regulet Parental Control
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
