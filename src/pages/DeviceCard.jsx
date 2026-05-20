import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Stack,
  alpha,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Smartphone,
  Computer,
  ExitToApp,
  ChevronLeft,
  ChevronRight,
  Refresh,
} from "@mui/icons-material";

const DeviceCard = ({ devices, userData, theme, onLogoutClick, onRefresh }) => {
  const [currentDeviceIndex, setCurrentDeviceIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const [slideDirection, setSlideDirection] = React.useState("left");
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const devicesPerPage = 3;
  const totalDevices = devices?.length || 0;
  const totalPages = Math.ceil(totalDevices / devicesPerPage);

  // ✅ Fix: clamp index when devices list shrinks after a sign-out
  React.useEffect(() => {
    if (totalPages > 0 && currentDeviceIndex >= totalPages) {
      setCurrentDeviceIndex(totalPages - 1);
    }
  }, [totalDevices, totalPages, currentDeviceIndex]);

  const minSwipeDistance = 50;

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrevDevice = () => {
    if (isAnimating) return;
    setSlideDirection("right");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDeviceIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
      setIsAnimating(false);
    }, 50);
  };

  const handleNextDevice = () => {
    if (isAnimating) return;
    setSlideDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDeviceIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
      setIsAnimating(false);
    }, 50);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setSlideDirection("left");
      handleNextDevice();
    } else if (isRightSwipe) {
      setSlideDirection("right");
      handlePrevDevice();
    }
  };

  const getVisibleDevices = () => {
    if (!devices) return [];
    const startIndex = currentDeviceIndex * devicesPerPage;
    return devices.slice(startIndex, startIndex + devicesPerPage);
  };

  const isMainDevice = (device) => {
    return device.androidId === userData.androidId;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        height: "100%",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 48px ${alpha(theme.primary, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #a8d8ff 0%, #8cefff 100%)",
              borderRadius: 2,
              p: 1,
              boxShadow: "0 6px 16px rgba(0, 188, 212, 0.25)",
              flexShrink: 0,
            }}
          >
            <Smartphone sx={{ fontSize: 20, color: "#00bcd4" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Devices
          </Typography>
          <Chip
            label={`${totalDevices} Device${totalDevices !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              background: theme.gradient,
              color: "white",
              fontWeight: "bold",
              height: 24,
              ml: "auto !important",
            }}
          />
          {/* ── Individual Refresh Button ── */}
          <Tooltip title="Refresh devices" placement="top">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="small"
              sx={{
                width: 30,
                height: 30,
                background: alpha(theme.primary, 0.08),
                border: `1px solid ${alpha(theme.primary, 0.2)}`,
                color: theme.primary,
                transition: "all 0.25s ease",
                "&:hover": {
                  background: alpha(theme.primary, 0.16),
                  border: `1px solid ${alpha(theme.primary, 0.4)}`,
                  transform: "scale(1.1)",
                },
                "&.Mui-disabled": {
                  background: alpha(theme.primary, 0.04),
                  border: `1px solid ${alpha(theme.primary, 0.1)}`,
                },
              }}
            >
              {isRefreshing ? (
                <CircularProgress size={14} sx={{ color: theme.primary }} />
              ) : (
                <Refresh sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        <Box
          sx={{
            position: "relative",
            px: totalDevices > devicesPerPage ? { xs: 3, sm: 2 } : 0,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {totalDevices > devicesPerPage && (
            <>
              <IconButton
                onClick={handlePrevDevice}
                sx={{
                  position: "absolute",
                  left: { xs: -4, sm: -16 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  width: { xs: 24, sm: 28 },
                  height: { xs: 24, sm: 28 },
                  "&:hover": {
                    background: theme.gradient,
                    transform: "translateY(-50%) scale(1.1)",
                    "& svg": { color: "white" },
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <ChevronLeft
                  sx={{ color: theme.primary, fontSize: { xs: 16, sm: 18 } }}
                />
              </IconButton>
              <IconButton
                onClick={handleNextDevice}
                sx={{
                  position: "absolute",
                  right: { xs: -4, sm: -16 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  width: { xs: 24, sm: 28 },
                  height: { xs: 24, sm: 28 },
                  "&:hover": {
                    background: theme.gradient,
                    transform: "translateY(-50%) scale(1.1)",
                    "& svg": { color: "white" },
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <ChevronRight
                  sx={{ color: theme.primary, fontSize: { xs: 16, sm: 18 } }}
                />
              </IconButton>
            </>
          )}

          {/* Devices Grid */}
          <Grid
            container
            spacing={{ xs: 1, sm: 1.5 }}
            justifyContent="center"
            sx={{
              animation: isAnimating
                ? "none"
                : `slideIn${slideDirection === "left" ? "Left" : "Right"} 0.4s ease-out`,
              "@keyframes slideInLeft": {
                "0%": { transform: "translateX(100%)", opacity: 0 },
                "100%": { transform: "translateX(0)", opacity: 1 },
              },
              "@keyframes slideInRight": {
                "0%": { transform: "translateX(-100%)", opacity: 0 },
                "100%": { transform: "translateX(0)", opacity: 1 },
              },
            }}
          >
            {getVisibleDevices().map((device, index) => {
              const actualIndex = currentDeviceIndex * devicesPerPage + index;
              return (
                <Grid item xs={12} sm={6} md={5} key={device.deviceId}>
                  <Box
                    sx={{
                      minHeight: { xs: "auto", sm: 260 },
                      minWidth: { xs: 0, sm: 250 },
                      p: { xs: 1.5, sm: 2.5 },
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alpha(theme.primary, 0.2),
                      background: `linear-gradient(135deg, ${alpha(theme.primary, 0.03)} 0%, ${alpha(theme.secondary, 0.03)} 100%)`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: theme.primary,
                        boxShadow: `0 4px 16px ${alpha(theme.primary, 0.15)}`,
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <Stack spacing={1.2}>
                      {/* Device Header */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{
                            background: theme.gradient,
                            width: { xs: 30, sm: 36 },
                            height: { xs: 30, sm: 36 },
                            boxShadow: `0 2px 8px ${theme.glow}`,
                            flexShrink: 0,
                          }}
                        >
                          {device.source === "mobile" ? (
                            <Smartphone sx={{ fontSize: { xs: 15, sm: 18 } }} />
                          ) : (
                            <Computer sx={{ fontSize: { xs: 15, sm: 18 } }} />
                          )}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            noWrap
                            sx={{ fontSize: "0.8rem" }}
                          >
                            Device {actualIndex + 1}
                          </Typography>
                          {isMainDevice(device) && (
                            <Chip
                              label="Main"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                                background: theme.gradient,
                                color: "white",
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </Stack>

                      {/* Device Info */}
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          display="block"
                          noWrap
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {device.manufacturer} {device.model}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          noWrap
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {device.osName} {device.osVersion}
                        </Typography>
                      </Box>

                      {/* Device Details */}
                      <Stack spacing={0.6}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          gap="12px"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            Last Active
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight="600"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {formatDateTime(device.loginAt)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            Version
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight="600"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            v{device.appVersion}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Logout Button */}
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        size="small"
                        startIcon={<ExitToApp sx={{ fontSize: 14 }} />}
                        onClick={() => onLogoutClick(device.deviceId)}
                        sx={{
                          px: 2,
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
                          "&:hover": {
                            background: "rgba(255,107,107,0.22)",
                            border: "1px solid rgba(255,107,107,0.5)",
                            boxShadow: "0 4px 16px rgba(255,107,107,0.2)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.25s ease",
                        }}
                      >
                        Signout
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Carousel Indicators */}
          {totalDevices > devicesPerPage && (
            <Stack
              direction="row"
              spacing={0.75}
              justifyContent="center"
              sx={{ mt: 1.5 }}
            >
              {Array.from({ length: totalPages }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentDeviceIndex(index)}
                  sx={{
                    width: currentDeviceIndex === index ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background:
                      currentDeviceIndex === index
                        ? theme.gradient
                        : alpha(theme.primary, 0.3),
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        currentDeviceIndex === index
                          ? theme.gradient
                          : alpha(theme.primary, 0.5),
                    },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;