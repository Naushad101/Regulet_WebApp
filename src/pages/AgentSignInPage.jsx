import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { VITE_API_BASE_URL, VITE_API_SALE_TEAM } from "../config";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f0f2f5", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, fontSize: "15px" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
    },
  },
});

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LOGIN_URL = `${VITE_API_SALE_TEAM}/sales-login`;

// Props:
//   onSignInSuccess(data) — called with enriched API data on successful login
export default function LoginPage({ onSignInSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.statusCode === 200) {
        // Enrich with loginTime so dashboard can show session start
        const enriched = { ...data.data, loginTime: new Date().toISOString() };
        if (onSignInSuccess) onSignInSuccess(enriched);
      } else {
        setApiError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setApiError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo / Brand */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                component="img"
                src="/regula_icon.png"
                alt="Regula Logo"
                sx={{ width: 64, height: 64, objectFit: "contain", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Welcome!
              </Typography>
            </Box>

            <Box noValidate component="form" autoComplete="off">
              {apiError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {apiError}
                </Alert>
              )}

              {/* Email */}
              <Box mb={2.5}>
                <Typography variant="body2" fontWeight={500} mb={0.75} color="text.primary">
                  Email
                </Typography>
                <TextField
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  error={!!errors.email}
                  helperText={errors.email}
                  autoComplete="off"
                  type="email"
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fafafa" } }}
                />
              </Box>

              {/* Password */}
              <Box mb={1}>
                <Typography variant="body2" fontWeight={500} mb={0.75} color="text.primary">
                  Password
                </Typography>
                <TextField
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  error={!!errors.password}
                  helperText={errors.password}
                  autoComplete="new-password"
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fafafa" } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Login Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleLogin}
                disabled={loading}
                sx={{ mt: 3, py: 1.25, borderRadius: 2, fontSize: "15px" }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Log in"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}