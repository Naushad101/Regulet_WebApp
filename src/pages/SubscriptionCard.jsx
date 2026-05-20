import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  alpha,
  IconButton,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  CircularProgress,
  Collapse,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import {
  CalendarToday,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Close,
  Stars,
  LocalFireDepartment,
  Diamond,
  Verified,
  Warning,
  Bolt,
  LocalOffer,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { VITE_API_BASE_URL, VITE_API_PAYMENT_BASE_URL } from "../config";

const commonFeatures = [
  "App, URL & Keyword Blocking (Unlimited)",
  "Adult Content Blocking",
  "Parental Control - Access Lock",
  "Accountability Partner Setup",
  "Allow / Reject via Email",
  "Block Custom Browsers",
  "Dumb Mode (Calls, SMS, Maps, +1)",
  "Block Social Media Apps",
  "Prevent Uninstall & Unblocking",
  "Block VPN Deletion",
  "Profile Managed from Web Portal",
];

const getPlanTheme = (plan) => {
  const themes = {
    lite: {
      primary: "#1d2236",
      secondary: "#1d0931",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(5, 10, 32, 0.3)",
      icon: Stars,
    },
    pro: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: LocalFireDepartment,
    },
    basic: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: Stars,
    },
    individual: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: Stars,
    },
    premium: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: Diamond,
    },
    family: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: Diamond,
    },
    enterprise: {
      primary: "#667eea",
      secondary: "#764ba2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardAccent: "linear-gradient(135deg, #a8b3ff 0%, #c9b3ff 100%)",
      glow: "rgba(102, 126, 234, 0.3)",
      icon: Verified,
    },
  };
  return themes[plan?.toLowerCase()] || themes.lite;
};

const CYCLE_META = {
  month: {
    key: "monthly",
    period: "MONTH",
    days: 30,
    badge: null,
    label: "30 days",
  },
  quarter: {
    key: "quarterly",
    period: "QUARTER",
    days: 90,
    badge: null,
    label: "90 days",
  },
  halfyear: {
    key: "halfyearly",
    period: "HALFYEAR",
    days: 180,
    badge: "POPULAR",
    label: "180 days",
  },
  year: {
    key: "yearly",
    period: "YEAR",
    days: 365,
    badge: "BEST VALUE",
    label: "annually",
  },
};

const buildPlansFromApi = (apiPlans) => {
  const result = { monthly: [], quarterly: [], halfyearly: [], yearly: [] };
  apiPlans.forEach((p) => {
    const meta = CYCLE_META[p.name];
    if (!meta) return;
    const indActual = p.pricing.actual;
    const indDiscounted = p.pricing.discounted;
    const indPerDay = p.perDay;
    const famActual = indActual * 2;
    const famDiscounted = indDiscounted * 2;
    const famPerDay = indPerDay * 2;

    result[meta.key] = [
      {
        name: "Individual",
        planId: "INDIVIDUAL",
        actualPrice: indActual,
        discountedPrice: indDiscounted,
        discountPercent: p.pricing.discountPercent,
        period: meta.period,
        durationDays: meta.days,
        billingNote: `₹${indActual} billed ${meta.label}`,
        chargeAmount: indActual,
        discountedAmount: indDiscounted,
        perDayActual: indPerDay,
        perDayDiscounted: indPerDay,
        features: ["Single Device Only"],
        theme: getPlanTheme("individual"),
        recommended: false,
        badge: meta.badge,
      },
      {
        name: "Family",
        planId: "FAMILY",
        actualPrice: famActual,
        discountedPrice: famDiscounted,
        discountPercent: p.pricing.discountPercent,
        period: meta.period,
        durationDays: meta.days,
        billingNote: `₹${famActual} billed ${meta.label}`,
        chargeAmount: famActual,
        discountedAmount: famDiscounted,
        perDayActual: famPerDay,
        perDayDiscounted: famPerDay,
        features: ["Multi Device Support (Up to 4)"],
        theme: getPlanTheme("family"),
        recommended: true,
        badge: meta.badge || "MOST POPULAR",
      },
    ];
  });
  return result;
};

// Fallback static plans (shown while API loads or on error)
const FALLBACK_PLANS = buildPlansFromApi([
  {
    name: "month",
    perDay: 5,
    pricing: { actual: 175, discounted: 150, discountPercent: 10 },
  },
  {
    name: "quarter",
    perDay: 4,
    pricing: { actual: 420, discounted: 360, discountPercent: 15 },
  },
  {
    name: "halfyear",
    perDay: 3,
    pricing: { actual: 660, discounted: 540, discountPercent: 10 },
  },
  {
    name: "year",
    perDay: 2,
    pricing: { actual: 910, discounted: 730, discountPercent: 10 },
  },
]);

// ── Status helpers ────────────────────────────────────────────────────────────
const isStatusActive = (status) =>
  typeof status === "string"
    ? status.toUpperCase() === "ACTIVE"
    : status === true;

const isStatusExpired = (status, planName) => {
  if (typeof status !== "string") return false;
  const s = status.toUpperCase();
  const p = planName?.toUpperCase();
  return s === "EXPIRED" || (s === "INACTIVE" && p === "LITE");
};

const isStatusInactive = (status) =>
  typeof status === "string"
    ? status.toUpperCase() === "INACTIVE"
    : status === false;
// ─────────────────────────────────────────────────────────────────────────────

// ── Price Display Component ───────────────────────────────────────────────────
const PlanPriceDisplay = ({ plan, hasRefCode, isMobile }) => {
  const starTooltip = hasRefCode
    ? `Reference code applied! Discounted price: ₹${plan.discountedPrice}`
    : "Have a reference code? You will be eligible for an additional discount at checkout!";

  return (
    <Box>
      {/* Main price row: per-day rate + discounted total in brackets + asterisk */}
      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={0.4}
          flexWrap="wrap"
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="800"
            sx={{
              color: plan.recommended ? "#B8C1E8" : "#8895BE",
              lineHeight: 1,
            }}
          >
            ₹{plan.perDayActual}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}
          >
            /day
          </Typography>
          {/* Discounted total always visible in green brackets */}
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{ color: "#69f0ae", fontSize: "0.72rem", ml: 0.2 }}
          >
            (₹{plan.discountedPrice})
          </Typography>
        </Stack>

        {/* Asterisk — tooltip reveals discount info */}
        <Tooltip
          title={starTooltip}
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: hasRefCode ? "#2e7d32" : "#1a1a2e",
                color: "white",
                fontSize: "0.75rem",
                borderRadius: 1.5,
                px: 1.5,
                py: 0.8,
                boxShadow: hasRefCode
                  ? "0 4px 16px rgba(76,175,80,0.4)"
                  : "0 4px 16px rgba(0,0,0,0.3)",
                "& .MuiTooltip-arrow": {
                  color: hasRefCode ? "#2e7d32" : "#1a1a2e",
                },
              },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontWeight: "900",
              lineHeight: 1,
              cursor: "pointer",
              color: hasRefCode ? "#FFD700" : "rgba(255,215,0,0.55)",
              animation: hasRefCode
                ? "asteriskPulse 1.5s ease-in-out infinite"
                : "none",
              "@keyframes asteriskPulse": {
                "0%, 100%": { filter: "drop-shadow(0 0 4px #FFD700)" },
                "50%": { filter: "drop-shadow(0 0 10px #FFD700)" },
              },
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#FFD700",
                filter: "drop-shadow(0 0 6px #FFD700)",
              },
              userSelect: "none",
            }}
          >
            *
          </Typography>
        </Tooltip>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "0.68rem",
          display: "block",
          mt: 0.1,
        }}
      >
        {plan.billingNote}
      </Typography>
    </Box>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const SubscriptionCard = ({
  userData,
  theme,
  showNotification,
  onProfileRefresh,
  onRefresh,
}) => {
  const BASE_URL = VITE_API_BASE_URL;
  const PAYMENT_BASE_URL = VITE_API_PAYMENT_BASE_URL;

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [currentSubscriptionIndex, setCurrentSubscriptionIndex] =
    React.useState(0);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [activationConfirmOpen, setActivationConfirmOpen] =
    React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState(null);

  // ── Billing cycle toggle ──────────────────────────────────────────────────
  const [billingCycle, setBillingCycle] = React.useState("yearly");

  // ── API Plans State ───────────────────────────────────────────────────────
  const [allPlans, setAllPlans] = React.useState(FALLBACK_PLANS);
  const [plansLoading, setPlansLoading] = React.useState(true);
  const [plansError, setPlansError] = React.useState(false);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(false);
        const plansUrl = `${VITE_API_BASE_URL}/plans`;
        const res = await fetch(plansUrl);
        const json = await res.json();
        if (json.statusCode === 200 && json.data?.plans?.length) {
          setAllPlans(buildPlansFromApi(json.data.plans));
        } else {
          setPlansError(true);
        }
      } catch (e) {
        console.error("Failed to fetch subscription plans:", e);
        setPlansError(true);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const plans = allPlans[billingCycle] ?? FALLBACK_PLANS[billingCycle];

  // ── Reference Code State ──────────────────────────────────────────────────
  const [refCodePromptOpen, setRefCodePromptOpen] = React.useState(false);
  const [refCodeEntryOpen, setRefCodeEntryOpen] = React.useState(false);
  const [pendingPlan, setPendingPlan] = React.useState(null);
  const [refCodeInput, setRefCodeInput] = React.useState("");
  const [refCodeStatus, setRefCodeStatus] = React.useState(null); // null | "validating" | "valid" | "invalid"
  const [discountInfo, setDiscountInfo] = React.useState(null);
  // hasValidRefCode tracks whether a valid ref code has been applied for price display
  const hasValidRefCode = refCodeStatus === "valid" && discountInfo !== null;

  // ── Swipe state ───────────────────────────────────────────────────────────
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const [slideDirection, setSlideDirection] = React.useState("left");
  const [isAnimating, setIsAnimating] = React.useState(false);
  const minSwipeDistance = 50;

  const subscriptionsPerPage = 1;

  // ── Last expired subscription (shown when user has no active/inactive paid plan) ──
  const lastExpiredSubscription = React.useMemo(() => {
    if (!userData?.subscriptions) return null;
    const hasActivePaidPlan = userData.subscriptions.some(
      (s) =>
        !isStatusExpired(s.status, s.planName) &&
        s.planName?.toLowerCase() !== "lite",
    );
    if (hasActivePaidPlan) return null;
    const expired = userData.subscriptions
      .filter(
        (s) =>
          isStatusExpired(s.status, s.planName) &&
          s.planName?.toLowerCase() !== "lite",
      )
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
    return expired[0] ?? null;
  }, [userData?.subscriptions]);

  const visibleSubscriptionsCount = React.useMemo(() => {
    if (!userData?.subscriptions) return 0;
    const nonExpired = userData.subscriptions.filter(
      (s) => !isStatusExpired(s.status, s.planName),
    ).length;
    // If no non-expired plans but there's a last expired one, count it as 1
    if (nonExpired === 0 && lastExpiredSubscription) return 1;
    return nonExpired;
  }, [userData?.subscriptions, lastExpiredSubscription]);

  const [isRefreshingSub, setIsRefreshingSub] = React.useState(false);

  const handleSubRefresh = async () => {
    if (isRefreshingSub || !onRefresh) return;
    setIsRefreshingSub(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshingSub(false);
    }
  };

  React.useEffect(() => {
    setCurrentSubscriptionIndex(0);
  }, [visibleSubscriptionsCount]);

  const totalSubscriptionPages = Math.ceil(
    visibleSubscriptionsCount / subscriptionsPerPage,
  );

  const handlePrevSubscription = () => {
    if (isAnimating) return;
    setSlideDirection("right");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSubscriptionIndex((prev) =>
        prev > 0 ? prev - 1 : totalSubscriptionPages - 1,
      );
      setIsAnimating(false);
    }, 50);
  };

  const handleNextSubscription = () => {
    if (isAnimating) return;
    setSlideDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSubscriptionIndex((prev) =>
        prev < totalSubscriptionPages - 1 ? prev + 1 : 0,
      );
      setIsAnimating(false);
    }, 50);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextSubscription();
    else if (distance < -minSwipeDistance) handlePrevSubscription();
  };

  const getVisibleSubscriptions = () => {
    if (!userData?.subscriptions) return [];

    const nonExpired = [...userData.subscriptions]
      .filter((s) => !isStatusExpired(s.status, s.planName))
      .sort((a, b) => {
        const aActive = isStatusActive(a.status) ? 0 : 1;
        const bActive = isStatusActive(b.status) ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        return new Date(b.purchasedOn) - new Date(a.purchasedOn);
      });

    // If no active/inactive plans exist, fall back to the last expired subscription
    const source =
      nonExpired.length === 0 && lastExpiredSubscription
        ? [lastExpiredSubscription]
        : nonExpired;

    const safeIndex = Math.min(
      currentSubscriptionIndex,
      Math.max(0, Math.ceil(source.length / subscriptionsPerPage) - 1),
    );
    const startIndex = safeIndex * subscriptionsPerPage;
    return source.slice(startIndex, startIndex + subscriptionsPerPage);
  };

  const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;
    return isStatusActive(subscription.status);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (subscription) => {
    const endDateStr = subscription?.endDate || userData?.currentPlanEndsOn;
    if (!endDateStr) return 0;
    const endDate = new Date(endDateStr);
    const today = new Date();
    const startDate = subscription?.startDate
      ? new Date(subscription.startDate)
      : today;
    const fromDate = today > startDate ? today : startDate;
    const diffTime = endDate - fromDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getSecondsRemaining = () => {
    if (!userData?.currentPlanEndsOn) return 0;
    const endDate = new Date(userData?.currentPlanEndsOn);
    const today = new Date();
    const diffTime = endDate - today;
    const diffSeconds = Math.ceil(diffTime / 1000);
    return diffSeconds > 0 ? diffSeconds : 0;
  };

  const RENEW_THRESHOLD_DAYS = 5;

  const getRemainingDays = () => {
    const secondsRemaining = getSecondsRemaining();
    return Math.ceil(secondsRemaining / (24 * 60 * 60));
  };

  const shouldShowUpgradeButton = () => {
    const currentPlan = userData?.currentActivePlan?.toLowerCase();
    if (currentPlan === "lite") return true;
    if (currentPlan === "individual" || currentPlan === "family") {
      return getRemainingDays() <= RENEW_THRESHOLD_DAYS;
    }
    return false;
  };

  const getUpgradeButtonText = () => {
    const currentPlan = userData?.currentActivePlan?.toLowerCase();
    const daysRemaining = getRemainingDays();
    if (currentPlan === "lite") return "Upgrade";
    if (
      (currentPlan === "individual" || currentPlan === "family") &&
      daysRemaining <= RENEW_THRESHOLD_DAYS
    )
      return "Renew Plan";
    return "Upgrade";
  };

  const getProgressPercentage = (subscription) => {
    if (!subscription) return 0;
    const start = new Date(subscription.startDate);
    const end = new Date(subscription.endDate);
    const today = new Date();
    const total = end - start;
    const elapsed = today - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const isCurrentActivePlan = (plan) => {
    if (!userData?.subscriptions) return false;
    const activeSubscription = userData.subscriptions.find(
      (s) => String(s.status).toUpperCase() === "ACTIVE",
    );
    if (!activeSubscription) return false;
    const planNameMatches =
      activeSubscription.planId?.toUpperCase() === plan.planId?.toUpperCase();
    const activePeriod = activeSubscription.planPeriod?.toUpperCase();
    const periodMatches = activePeriod === plan.period;
    return planNameMatches && periodMatches;
  };

  const getPlanDurationDays = () => {
    const map = { monthly: 30, quarterly: 90, halfyearly: 180, yearly: 365 };
    return map[billingCycle] || 30;
  };

  // ── Reference Code Helpers ────────────────────────────────────────────────
  const getDiscountedAmount = (baseAmount, discountPct) => {
    const discount = (baseAmount * discountPct) / 100;
    return Math.round(baseAmount - discount);
  };

  const resetRefCodeState = () => {
    setRefCodeInput("");
    setRefCodeStatus(null);
    setDiscountInfo(null);
    setPendingPlan(null);
  };

  const handleSubscribeClick = (plan) => {
    if (isCurrentActivePlan(plan)) return;
    setPendingPlan(plan);
    setRefCodePromptOpen(true);
  };

  const handleNoRefCode = () => {
    setRefCodePromptOpen(false);
    if (pendingPlan) {
      handleSubscribe(pendingPlan, null, 0);
    }
    resetRefCodeState();
  };

  const handleYesRefCode = () => {
    setRefCodePromptOpen(false);
    setRefCodeEntryOpen(true);
  };

  const handleValidateRefCode = async () => {
    if (!refCodeInput.trim()) return;
    setRefCodeStatus("validating");
    setDiscountInfo(null);
    try {
      const response = await fetch(
        `${PAYMENT_BASE_URL}/validate-reference-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.userId,
            referenceCode: refCodeInput.trim(),
          }),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200 && data.data) {
        setRefCodeStatus("valid");
        setDiscountInfo(data.data);
      } else {
        setRefCodeStatus("invalid");
      }
    } catch (error) {
      console.error("Ref code validation error:", error);
      setRefCodeStatus("invalid");
    }
  };

 const handleProceedWithRefCode = () => {
  setRefCodeEntryOpen(false);
  if (pendingPlan) {
    const discount = pendingPlan.discountPercent ?? 0;
    const code = refCodeStatus === "valid" ? refCodeInput.trim() : null;
    const finalAmount = getDiscountedAmount(pendingPlan.chargeAmount, discount);

    if (finalAmount === 0) {
      // 100% discount — skip payment, activate directly
      handleFreeSubscription(pendingPlan, code);
    } else {
      handleSubscribe(pendingPlan, code, discount);
    }
  }
  resetRefCodeState();
};

  const handleSkipRefCode = () => {
    setRefCodeEntryOpen(false);
    if (pendingPlan) {
      handleSubscribe(pendingPlan, null, 0);
    }
    resetRefCodeState();
  };


  const handleFreeSubscription = async (plan, refCode) => {
  try {
    const durationDays = getPlanDurationDays();
    const now = new Date();
    const startDate = now.toISOString().split("T")[0];
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + durationDays,
    )
      .toISOString()
      .split("T")[0];

    const subscribeResponse = await fetch(`${BASE_URL}/user/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: userData.emails,
        userId: userData.userId,
        subscriptions: {
          planId: plan.planId,
          planName: plan.name,
          planPeriod: plan.period,
          purchasedOn: now.toISOString(),
          startDate,
          endDate,
          status: "ACTIVE",
        },
        referenceCode: refCode,
      }),
    });

    const subscribeData = await subscribeResponse.json();

    if (subscribeData.statusCode === 200 || subscribeData.success) {
      showNotification?.(
        "🎉 Subscription activated successfully with your reference code!",
        "success",
      );
      setUpgradeModalOpen(false);
      await onProfileRefresh?.();
    } else {
      throw new Error(
        subscribeData.message || "Failed to save subscription details",
      );
    }
  } catch (error) {
    console.error("Free subscription error:", error);
    showNotification?.(
      `Failed to activate subscription: ${error.message || "Please try again."}`,
      "error",
    );
    await onProfileRefresh?.();
  }
};

  const handleSubscribe = async (plan, refCode = null, discountPct = 0) => {
    try {
      const baseAmount = plan.chargeAmount;
      const amount =
        discountPct > 0
          ? getDiscountedAmount(baseAmount, discountPct)
          : baseAmount;
      const durationDays = getPlanDurationDays();

      const orderResponse = await fetch(`${PAYMENT_BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          userName: userData.fullName,
          userEmail: userData.emails,
          amount,
          planName: plan.name,
          referenceCode: refCode,
          environment: userData.isProd ? "prod" : "test",
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || orderData.statusCode !== 200) {
        throw new Error(orderData.message || "Failed to create order");
      }

      if (!orderData.data?.orderId || !orderData.data?.amount) {
        throw new Error(
          "Invalid response from server. Missing required payment fields.",
        );
      }

      const cycleLabel =
        {
          monthly: "Monthly",
          quarterly: "Quarterly",
          halfyearly: "Half-Yearly",
          yearly: "Yearly",
        }[billingCycle] || billingCycle;

      const options = {
        key: userData.isProd
          ? "rzp_live_SQFqrFV77CH11h"
          : "rzp_test_SEnjSFS71tr2XZ",
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: "BNT Soft",
        description: `${plan.name} Plan – ${cycleLabel}${discountPct > 0 ? ` (${discountPct}% off)` : ""}`,
        image: "/logo.png",
        order_id: orderData.data.orderId,

        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              `${PAYMENT_BASE_URL}/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  environment: userData.isProd ? "prod" : "test",
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.statusCode === 200 || verifyData.success) {
              const now = new Date();
              const startDate = now.toISOString().split("T")[0];
              const endDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + durationDays,
              )
                .toISOString()
                .split("T")[0];

              const subscribeResponse = await fetch(
                `${BASE_URL}/user/subscription`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    emails: userData.emails,
                    userId: userData.userId,
                    subscriptions: {
                      planId: plan.planId,
                      planName: plan.name,
                      planPeriod: plan.period,
                      purchasedOn: now.toISOString(),
                      startDate,
                      endDate,
                      status: "ACTIVE",
                    },
                    referenceCode: discountInfo?.referenceCode,
                  }),
                },
              );

              const subscribeData = await subscribeResponse.json();

              if (subscribeData.statusCode === 200 || subscribeData.success) {
                showNotification?.(
                  "🎉 Payment successful! Your subscription is now active.",
                  "success",
                );
                setUpgradeModalOpen(false);
                await onProfileRefresh?.();
              } else {
                throw new Error(
                  subscribeData.message ||
                    "Failed to save subscription details",
                );
              }
            } else {
              showNotification?.(
                `Payment verification failed. Please contact support with payment ID: ${response.razorpay_payment_id}`,
                "error",
              );
            }
          } catch (error) {
            console.error("Verification/Subscription error:", error);
            showNotification?.(
              `Payment completed but verification failed. Please contact support with payment ID: ${response.razorpay_payment_id}`,
              "warning",
            );
          }
        },

        prefill: {
          name: userData.fullName,
          email: userData.emails,
          contact: userData.phone || "",
        },

        notes: {
          userId: userData.userId,
          planName: plan.name,
          billingCycle,
          ...(refCode ? { referenceCode: refCode } : {}),
          ...(discountPct > 0 ? { discountPercentage: discountPct } : {}),
        },

        theme: { color: "#667eea" },

        modal: {
          ondismiss: function () {
            showNotification?.("Payment cancelled", "info");
            onProfileRefresh?.();
          },
          escape: true,
          backdropclose: false,
        },
      };

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        showNotification?.(
          `Payment failed: ${response.error.description}. Reason: ${response.error.reason}`,
          "error",
        );
        onProfileRefresh?.();
      });

      rzp.open();
    } catch (error) {
      console.error("Subscription error details:", error);
      showNotification?.(
        `Failed to initiate payment: ${error.message || "Please try again."}`,
        "error",
      );
      await onProfileRefresh?.();
    }
  };

  const handleActivatePlan = async (subscription) => {
    try {
      const response = await fetch(`${BASE_URL}/activate-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          subscriptionId: subscription.subscriptionId,
        }),
      });

      const result = await response.json();

      if (result.statusCode === 200 || result.success) {
        showNotification?.(
          `🎉 ${
            subscription.planName.charAt(0).toUpperCase() +
            subscription.planName.slice(1)
          } plan activated successfully!`,
          "success",
        );
        await onProfileRefresh?.();
      } else {
        throw new Error(result.message || "Failed to activate plan");
      }
    } catch (error) {
      console.error("Activation error:", error);
      showNotification?.(`Failed to activate plan: ${error.message}`, "error");
    }
  };

  const handleActivateClick = (subscription) => {
    setSelectedSubscription(subscription);
    setActivationConfirmOpen(true);
  };

  const handleConfirmActivation = () => {
    if (selectedSubscription) handleActivatePlan(selectedSubscription);
    setActivationConfirmOpen(false);
    setSelectedSubscription(null);
  };

  const handleCancelActivation = () => {
    setActivationConfirmOpen(false);
    setSelectedSubscription(null);
  };

  const PlanIcon = theme.icon;

  // ── Billing cycle tab config ──────────────────────────────────────────────
  const cycleOptions = [
    { value: "yearly", label: "Year", badge: "SAVE" },
    { value: "halfyearly", label: "Half Yr", badge: null },
    { value: "quarterly", label: "Quarter", badge: null },
    { value: "monthly", label: "Month", badge: null },
  ];

  return (
    <>
      {/* ── Main Subscription Card ── */}
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
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                background: theme.cardAccent,
                borderRadius: 2,
                p: 1,
                boxShadow: `0 6px 16px ${theme.glow}`,
              }}
            >
              <CalendarToday sx={{ fontSize: 18.5, color: theme.primary }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Subscription
            </Typography>
            {/* ── Individual Refresh Button ── */}
            <Box>
              <Tooltip title="Refresh subscription" placement="top">
                <IconButton
                  onClick={handleSubRefresh}
                  disabled={isRefreshingSub}
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
                  {isRefreshingSub ? (
                    <CircularProgress size={14} sx={{ color: theme.primary }} />
                  ) : (
                    <Refresh sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>

          <Box
            sx={{
              position: "relative",
              px: visibleSubscriptionsCount > 1 ? 2 : 0,
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {visibleSubscriptionsCount > subscriptionsPerPage && (
              <>
                <IconButton
                  onClick={handlePrevSubscription}
                  sx={{
                    position: "absolute",
                    left: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      background: theme.gradient,
                      transform: "translateY(-50%) scale(1.1)",
                      "& svg": { color: "white" },
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ChevronLeft sx={{ color: theme.primary, fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={handleNextSubscription}
                  sx={{
                    position: "absolute",
                    right: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      background: theme.gradient,
                      transform: "translateY(-50%) scale(1.1)",
                      "& svg": { color: "white" },
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ChevronRight sx={{ color: theme.primary, fontSize: 18 }} />
                </IconButton>
              </>
            )}

            <Box
              sx={{
                animation: isAnimating
                  ? "none"
                  : slideDirection === "left"
                    ? "subscriptionSlideInLeft 0.4s ease-out"
                    : "subscriptionSlideInRight 0.4s ease-out",
                "@keyframes subscriptionSlideInLeft": {
                  "0%": { transform: "translateX(100%)", opacity: 0 },
                  "100%": { transform: "translateX(0)", opacity: 1 },
                },
                "@keyframes subscriptionSlideInRight": {
                  "0%": { transform: "translateX(-100%)", opacity: 0 },
                  "100%": { transform: "translateX(0)", opacity: 1 },
                },
              }}
            >
              {getVisibleSubscriptions().map((subscription, index) => {
                const isActive = isSubscriptionActive(subscription);
                const isInactive = isStatusInactive(subscription.status);
                const isExpired = isStatusExpired(
                  subscription.status,
                  subscription.planName,
                );

                return (
                  <Box key={index}>
                    <Stack spacing={1.5}>
                      {/* ── Subscription detail box ── */}
                      <Box
                        sx={{
                          background: isExpired
                            ? `linear-gradient(135deg, ${alpha("#f44336", 0.04)} 0%, ${alpha("#b71c1c", 0.04)} 100%)`
                            : isActive
                              ? `linear-gradient(135deg, ${alpha(theme.primary, 0.05)} 0%, ${alpha(theme.secondary, 0.05)} 100%)`
                              : `linear-gradient(135deg, ${alpha("#9e9e9e", 0.03)} 0%, ${alpha("#757575", 0.03)} 100%)`,
                          borderRadius: 2,
                          p: 1.5,
                          opacity: isExpired ? 0.9 : isActive ? 1 : 0.6,
                          border: isExpired
                            ? "1px solid rgba(244,67,54,0.25)"
                            : isActive
                              ? "none"
                              : "1px solid rgba(158,158,158,0.2)",
                        }}
                      >
                        <Stack spacing={1}>
                          {/* Plan name */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              Plan
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              sx={{
                                textTransform: "capitalize",
                                color: isExpired
                                  ? "#e53935"
                                  : isActive
                                    ? theme.primary
                                    : "#757575",
                              }}
                            >
                              {subscription.planName}
                            </Typography>
                          </Stack>

                          {/* Status */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              Status
                            </Typography>
                            <Chip
                              label={
                                isExpired
                                  ? "Expired"
                                  : isActive
                                    ? "Active"
                                    : isInactive
                                      ? "Inactive"
                                      : subscription.status
                              }
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                ...(isExpired
                                  ? {
                                      backgroundColor: alpha("#f44336", 0.12),
                                      color: "#c62828",
                                    }
                                  : isActive
                                    ? {}
                                    : {
                                        backgroundColor: alpha("#9e9e9e", 0.2),
                                        color: "#757575",
                                      }),
                              }}
                              color={isActive ? "success" : "default"}
                            />
                          </Stack>

                          {/* Billing cycle */}
                          {subscription.planName?.toLowerCase() !== "lite" && (
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight="600"
                              >
                                Billing Cycle
                              </Typography>
                              <Chip
                                label={
                                  subscription.planPeriod === "YEAR"
                                    ? "Yearly"
                                    : subscription.planPeriod === "QUARTER"
                                      ? "Quarterly"
                                      : subscription.planPeriod === "HALFYEAR"
                                        ? "Half-Yearly"
                                        : "Monthly"
                                }
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                  background: isExpired
                                    ? alpha("#f44336", 0.12)
                                    : isActive
                                      ? subscription.planPeriod === "YEAR"
                                        ? "linear-gradient(135deg, #b87913 0%, #f57f17 100%)"
                                        : theme.gradient
                                      : alpha("#9e9e9e", 0.2),
                                  color: isExpired
                                    ? "#c62828"
                                    : isActive
                                      ? "white"
                                      : "#757575",
                                }}
                              />
                            </Stack>
                          )}

                          {/* Start date */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              Start Date
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {formatDate(subscription.startDate)}
                            </Typography>
                          </Stack>

                          {/* End / Expired On date */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              {isExpired ? "Expired On" : "End Date"}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              sx={{
                                color: isExpired ? "#e53935" : "inherit",
                              }}
                            >
                              {formatDate(subscription.endDate)}
                            </Typography>
                          </Stack>

                          {/* Days left — hidden for expired */}
                          {!isExpired && (
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight="600"
                              >
                                Days Left
                              </Typography>
                              <Chip
                                icon={<TrendingUp sx={{ fontSize: 14 }} />}
                                label={`${getDaysRemaining(subscription)}`}
                                size="small"
                                sx={{
                                  background: isActive
                                    ? theme.gradient
                                    : alpha("#9e9e9e", 0.2),
                                  color: isActive ? "white" : "#757575",
                                  fontWeight: "bold",
                                  height: 24,
                                  "& .MuiChip-icon": {
                                    color: isActive ? "white" : "#757575",
                                  },
                                }}
                              />
                            </Stack>
                          )}
                        </Stack>
                      </Box>

                      {/* ── Progress bar — hidden for expired ── */}
                      {!isExpired && (
                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{ mb: 0.5 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              Plan Usage
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              sx={{
                                color: isActive ? theme.primary : "#9e9e9e",
                              }}
                            >
                              {isActive
                                ? Math.round(getProgressPercentage(subscription))
                                : 0}
                              %
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={
                              isActive
                                ? getProgressPercentage(subscription)
                                : 0
                            }
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              background: alpha(
                                isActive ? theme.primary : "#9e9e9e",
                                0.1,
                              ),
                              "& .MuiLinearProgress-bar": {
                                background: isActive
                                  ? theme.gradient
                                  : alpha("#9e9e9e", 0.4),
                                borderRadius: 4,
                                boxShadow: isActive
                                  ? `0 0 12px ${theme.glow}`
                                  : "none",
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* ── Action button ── */}
                      {isExpired ? (
                        // Renew button for expired subscription
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          startIcon={<Refresh sx={{ fontSize: 16 }} />}
                          onClick={() => setUpgradeModalOpen(true)}
                          sx={{
                            py: 1,
                            background:
                              "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                            fontWeight: "bold",
                            boxShadow: "0 6px 20px rgba(229,57,53,0.35)",
                            color: "white",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 24px rgba(229,57,53,0.45)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Renew Plan
                        </Button>
                      ) : isActive ? (
                        shouldShowUpgradeButton() && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            startIcon={<PlanIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setUpgradeModalOpen(true)}
                            sx={{
                              py: 1,
                              background: theme.gradient,
                              fontWeight: "bold",
                              boxShadow: `0 6px 20px ${theme.glow}`,
                              color: "white",
                              "&:hover": {
                                background: theme.gradient,
                                transform: "translateY(-1px)",
                                boxShadow: `0 8px 24px ${theme.glow}`,
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {getUpgradeButtonText()}
                          </Button>
                        )
                      ) : isInactive &&
                        subscription.planName?.toLowerCase() !== "lite" ? (
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          startIcon={<Check sx={{ fontSize: 16 }} />}
                          onClick={() => handleActivateClick(subscription)}
                          sx={{
                            py: 1,
                            background:
                              "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                            fontWeight: "bold",
                            boxShadow: "0 6px 20px rgba(76,175,80,0.3)",
                            color: "white",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 24px rgba(76,175,80,0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Activate Plan
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                );
              })}
            </Box>

            {visibleSubscriptionsCount > subscriptionsPerPage && (
              <Stack
                direction="row"
                spacing={0.75}
                justifyContent="center"
                sx={{ mt: 1.5 }}
              >
                {Array.from({ length: totalSubscriptionPages }).map(
                  (_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentSubscriptionIndex(index)}
                      sx={{
                        width: currentSubscriptionIndex === index ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background:
                          currentSubscriptionIndex === index
                            ? theme.gradient
                            : alpha(theme.primary, 0.3),
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            currentSubscriptionIndex === index
                              ? theme.gradient
                              : alpha(theme.primary, 0.5),
                        },
                      }}
                    />
                  ),
                )}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Reference Code Prompt Dialog ── */}
      <Dialog
        open={refCodePromptOpen}
        onClose={() => {
          setRefCodePromptOpen(false);
          resetRefCodeState();
        }}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: "#ffffff",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            ...(isMobile && {
              margin: 0,
              maxHeight: "100%",
              justifyContent: "center",
            }),
          },
        }}
      >
        <IconButton
          onClick={() => {
            setRefCodePromptOpen(false);
            resetRefCodeState();
          }}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            color: "#666",
            bgcolor: "rgba(0,0,0,0.05)",
            width: 30,
            height: 30,
            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>

        <DialogContent sx={{ p: isMobile ? 3 : 3.5 }}>
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(92,107,192,0.3)",
              }}
            >
              <LocalOffer sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1a1a2e", mb: 0.75 }}
              >
                Have a Reference Code?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#555", lineHeight: 1.6 }}
              >
                If you have a reference code from a sales representative, enter
                it at checkout to link your purchase.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleNoRefCode}
                sx={{
                  py: isMobile ? 1.5 : 1.2,
                  fontWeight: "bold",
                  color: "#555",
                  borderColor: "rgba(0,0,0,0.2)",
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.35)",
                    background: "rgba(0,0,0,0.03)",
                  },
                }}
              >
                No
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleYesRefCode}
                sx={{
                  py: isMobile ? 1.5 : 1.2,
                  fontWeight: "bold",
                  background:
                    "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                  boxShadow: "0 4px 16px rgba(92,107,192,0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
                    boxShadow: "0 6px 20px rgba(92,107,192,0.5)",
                  },
                }}
              >
                Yes
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Reference Code Entry Dialog ── */}
      <Dialog
        open={refCodeEntryOpen}
        onClose={() => {
          setRefCodeEntryOpen(false);
          resetRefCodeState();
        }}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: "#ffffff",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            ...(isMobile && {
              margin: 0,
              maxHeight: "100%",
              justifyContent: "center",
            }),
          },
        }}
      >
        <IconButton
          onClick={() => {
            setRefCodeEntryOpen(false);
            resetRefCodeState();
          }}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            color: "#666",
            bgcolor: "rgba(0,0,0,0.05)",
            width: 30,
            height: 30,
            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>

        <DialogContent sx={{ p: isMobile ? 3 : 3.5 }}>
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(92,107,192,0.3)",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <LocalOffer sx={{ fontSize: 26, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1a1a2e", mb: 0.5 }}
              >
                Enter Reference Code
              </Typography>
              <Typography variant="caption" sx={{ color: "#777" }}>
                Enter the code provided by your sales representative
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                fullWidth
                placeholder="e.g. REF12345"
                value={refCodeInput}
                onChange={(e) => {
                  setRefCodeInput(e.target.value.toUpperCase());
                  if (refCodeStatus) {
                    setRefCodeStatus(null);
                    setDiscountInfo(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && refCodeInput.trim())
                    handleValidateRefCode();
                }}
                size="small"
                inputProps={{ style: { letterSpacing: 1.5, color: "#1a1a2e" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8f9ff",
                    borderRadius: 1.5,
                    "& fieldset": {
                      borderColor:
                        refCodeStatus === "valid"
                          ? "#4caf50"
                          : refCodeStatus === "invalid"
                            ? "#f44336"
                            : "rgba(0,0,0,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor:
                        refCodeStatus === "valid"
                          ? "#4caf50"
                          : refCodeStatus === "invalid"
                            ? "#f44336"
                            : "rgba(0,0,0,0.35)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        refCodeStatus === "valid"
                          ? "#4caf50"
                          : refCodeStatus === "invalid"
                            ? "#f44336"
                            : "#7986CB",
                    },
                  },
                  "& input::placeholder": { color: "#aaa" },
                }}
              />
              <Button
                variant="contained"
                onClick={handleValidateRefCode}
                disabled={
                  !refCodeInput.trim() || refCodeStatus === "validating"
                }
                sx={{
                  minWidth: isMobile ? 80 : 90,
                  py: 1,
                  fontWeight: "bold",
                  fontSize: "0.78rem",
                  background:
                    "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
                  },
                  "&.Mui-disabled": {
                    background: "rgba(0,0,0,0.08)",
                    color: "rgba(0,0,0,0.3)",
                  },
                }}
              >
                {refCodeStatus === "validating" ? (
                  <CircularProgress size={16} sx={{ color: "#5C6BC0" }} />
                ) : (
                  "Validate"
                )}
              </Button>
            </Stack>

            <Collapse
              in={refCodeStatus === "valid" || refCodeStatus === "invalid"}
            >
              {refCodeStatus === "valid" && discountInfo && (
                <Box
                  sx={{
                    background: "rgba(76,175,80,0.06)",
                    border: "1px solid rgba(76,175,80,0.3)",
                    borderRadius: 2,
                    p: 1.8,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    mb={1}
                  >
                    <CheckCircle sx={{ color: "#4caf50", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: "#2e7d32" }}
                    >
                      Code validated successfully!
                    </Typography>
                  </Stack>
                  <Stack spacing={0.6}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: "#777" }}>
                        Sales Representative
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        sx={{ color: "#1a1a2e" }}
                      >
                        {discountInfo.salesPersonName}
                      </Typography>
                    </Stack>
                    {pendingPlan && (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mt={0.4}
                      >
                        <Typography variant="caption" sx={{ color: "#777" }}>
                          You pay
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#aaa",
                              textDecoration: "line-through",
                            }}
                          >
                            ₹{pendingPlan.chargeAmount}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: "#2e7d32" }}
                          >
                            ₹
                            {getDiscountedAmount(
                              pendingPlan.chargeAmount,
                              pendingPlan.discountPercent ?? 0,
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
              {refCodeStatus === "invalid" && (
                <Box
                  sx={{
                    background: "rgba(244,67,54,0.05)",
                    border: "1px solid rgba(244,67,54,0.25)",
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Cancel
                    sx={{ color: "#f44336", fontSize: 20, flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: "#c62828" }}>
                    Invalid or expired reference code. Please check and try
                    again.
                  </Typography>
                </Box>
              )}
            </Collapse>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSkipRefCode}
                sx={{
                  py: isMobile ? 1.5 : 1.1,
                  fontWeight: "bold",
                  color: "#555",
                  borderColor: "rgba(0,0,0,0.2)",
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.35)",
                    background: "rgba(0,0,0,0.03)",
                  },
                }}
              >
                Skip
              </Button>
              <Button
                variant="contained"
                fullWidth
                disabled={refCodeStatus !== "valid"}
                onClick={handleProceedWithRefCode}
                sx={{
                  py: isMobile ? 1.5 : 1.1,
                  fontWeight: "bold",
                  background:
                    refCodeStatus === "valid"
                      ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                      : undefined,
                  boxShadow:
                    refCodeStatus === "valid"
                      ? "0 4px 16px rgba(76,175,80,0.3)"
                      : undefined,
                  "&:hover":
                    refCodeStatus === "valid"
                      ? {
                          background:
                            "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                          boxShadow: "0 6px 20px rgba(76,175,80,0.4)",
                        }
                      : {},
                  "&.Mui-disabled": {
                    background: "rgba(0,0,0,0.08)",
                    color: "rgba(0,0,0,0.3)",
                  },
                }}
              >
                Apply & Pay
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Activation Confirmation Dialog ── */}
      <Dialog
        open={activationConfirmOpen}
        onClose={handleCancelActivation}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            ...(isMobile && {
              margin: 0,
              maxHeight: "100%",
              justifyContent: "center",
            }),
          },
        }}
      >
        <DialogContent sx={{ p: isMobile ? 2.5 : 3 }}>
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(76,175,80,0.3)",
              }}
            >
              <Check sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Activate{" "}
                {selectedSubscription?.planName?.charAt(0).toUpperCase() +
                  selectedSubscription?.planName?.slice(1)}{" "}
                Plan?
              </Typography>
              <Box
                sx={{
                  background: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.25)",
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    color: "#e53935",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Current Plan
                </Typography>
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                  <Typography variant="body2">
                    <strong>
                      {userData.currentActivePlan?.charAt(0).toUpperCase() +
                        userData.currentActivePlan?.slice(1)}
                    </strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? "0.72rem" : undefined }}
                  >
                    {formatDate(
                      userData.subscriptions?.find(
                        (s) => s.status?.toUpperCase() === "ACTIVE",
                      )?.startDate,
                    )}{" "}
                    → {formatDate(userData.currentPlanEndsOn)}
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  background: "rgba(76,175,80,0.08)",
                  border: "1px solid rgba(76,175,80,0.25)",
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    color: "#43a047",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Activating Plan
                </Typography>
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                  <Typography variant="body2">
                    <strong>
                      {selectedSubscription?.planName
                        ?.charAt(0)
                        .toUpperCase() +
                        selectedSubscription?.planName?.slice(1)}
                    </strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? "0.72rem" : undefined }}
                  >
                    {formatDate(selectedSubscription?.startDate)} →{" "}
                    {formatDate(selectedSubscription?.endDate)}
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  background: "rgba(255,152,0,0.08)",
                  border: "1px solid rgba(255,152,0,0.3)",
                  borderRadius: 2,
                  p: 1.2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Warning
                  sx={{ fontSize: 18, color: "#f57c00", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#e65100", textAlign: "left" }}
                >
                  Your current <strong>{userData.currentActivePlan}</strong>{" "}
                  plan will be <strong>deactivated immediately</strong> upon
                  activation.
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Do you want to activate the{" "}
                <strong>
                  {selectedSubscription?.planName?.charAt(0).toUpperCase() +
                    selectedSubscription?.planName?.slice(1)}
                </strong>{" "}
                plan now?
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ width: "100%", mt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancelActivation}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  fontWeight: "bold",
                  borderWidth: 1.5,
                  "&:hover": { borderWidth: 1.5 },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirmActivation}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  background:
                    "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #45a049 0%, #4caf50 100%)",
                    boxShadow: "0 6px 16px rgba(76,175,80,0.4)",
                  },
                }}
              >
                Activate Now
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Upgrade / Subscribe Modal ── */}
      <Dialog
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background:
              "linear-gradient(135deg, #0a0e1f 0%, #1a1f3a 50%, #0d1229 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            overflow: "hidden",
            maxHeight: isMobile ? "100%" : "95vh",
            ...(isMobile && { margin: 0 }),
          },
        }}
      >
        <IconButton
          onClick={() => setUpgradeModalOpen(false)}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            color: "white",
            bgcolor: "rgba(255,255,255,0.1)",
            zIndex: 1,
            width: 32,
            height: 32,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.2)",
              transform: "rotate(90deg)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "center",
            overflowY: "auto",
            py: isMobile ? 2 : 2.5,
            px: isMobile ? 1.5 : 3,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 1.5, mt: isMobile ? 3 : 0 }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="800"
              sx={{
                background:
                  "linear-gradient(135deg, #B8C1E8 0%, #7986CB 50%, #B8C1E8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5,
              }}
            >
              Choose Your Plan
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: isMobile ? "0.78rem" : "0.85rem",
              }}
            >
              Get unlimited access to all parental control features
            </Typography>
          </Box>

          {/* ── Plans loading / error indicator ── */}
          {(plansLoading || plansError) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                opacity: 0.75,
              }}
            >
              {plansLoading ? (
                <>
                  <CircularProgress
                    size={12}
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
                  >
                    Loading latest pricing…
                  </Typography>
                </>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: "#ff8a80", fontSize: "0.7rem" }}
                >
                  ⚠ Using cached pricing. Check your connection.
                </Typography>
              )}
            </Box>
          )}

          {/* ── 4-tab billing cycle toggle ── */}
          <Box sx={{ mb: 1.5 }}>
            <Box
              sx={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 3,
                p: 0.4,
                display: "flex",
                gap: 0.4,
              }}
            >
              {cycleOptions.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => setBillingCycle(opt.value)}
                  sx={{
                    position: "relative",
                    px: isMobile ? 1.2 : 1.8,
                    py: 0.7,
                    borderRadius: "10px",
                    cursor: "pointer",
                    background:
                      billingCycle === opt.value
                        ? "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)"
                        : "transparent",
                    boxShadow:
                      billingCycle === opt.value
                        ? "0 4px 12px rgba(92,107,192,0.4)"
                        : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        billingCycle === opt.value
                          ? "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)"
                          : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: isMobile ? "0.72rem" : "0.8rem",
                        fontWeight: 600,
                        color:
                          billingCycle === opt.value
                            ? "white"
                            : "rgba(255,255,255,0.6)",
                        whiteSpace: "nowrap",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {opt.label}
                    </Typography>
                    {opt.badge && (
                      <Chip
                        label={opt.badge}
                        size="small"
                        icon={
                          <Bolt
                            sx={{
                              fontSize: "9px !important",
                              color: "#FFD700 !important",
                            }}
                          />
                        }
                        sx={{
                          height: 15,
                          fontSize: "0.55rem",
                          fontWeight: "bold",
                          background:
                            "linear-gradient(135deg, #f9a825 0%, #f57f17 100%)",
                          color: "white",
                          px: 0.1,
                          "& .MuiChip-label": { px: 0.4 },
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ maxWidth: "900px", width: "100%" }}>
            <Grid
              container
              spacing={isMobile ? 1.5 : 2.5}
              justifyContent="center"
            >
              {/* Common Features */}
              <Grid item xs={12} md={5}>
                <Card
                  sx={{
                    background: "rgba(92,107,192,0.08)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(92,107,192,0.2)",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: isMobile ? 2 : 2.5,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        color: "#B8C1E8",
                        mb: isMobile ? 1.5 : 2,
                        textAlign: "center",
                        fontSize: isMobile ? "0.88rem" : "0.95rem",
                      }}
                    >
                      ✨ All Plans Include
                    </Typography>
                    <Box
                      sx={
                        isMobile
                          ? {
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "10px",
                            }
                          : {}
                      }
                    >
                      {isMobile ? (
                        commonFeatures.map((feature, idx) => (
                          <Stack
                            direction="row"
                            spacing={0.8}
                            alignItems="flex-start"
                            key={idx}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                mt: 0.2,
                              }}
                            >
                              <Check sx={{ fontSize: 10, color: "white" }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255,255,255,0.9)",
                                fontSize: "0.72rem",
                                lineHeight: 1.35,
                              }}
                            >
                              {feature}
                            </Typography>
                          </Stack>
                        ))
                      ) : (
                        <Stack
                          spacing={1.2}
                          sx={{ flex: 1, justifyContent: "center" }}
                        >
                          {commonFeatures.map((feature, idx) => (
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="flex-start"
                              key={idx}
                            >
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  mt: 0.2,
                                }}
                              >
                                <Check
                                  sx={{
                                    fontSize: 11,
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(255,255,255,0.9)",
                                  fontSize: "0.83rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                {feature}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Plan Cards */}
              <Grid item xs={12} md={7}>
                <Stack spacing={isMobile ? 1.5 : 2} sx={{ height: "100%" }}>
                  {plans.map((plan) => {
                    const isCurrent = isCurrentActivePlan(plan);

                    return (
                      <Card
                        key={plan.planId}
                        sx={{
                          flex: 1,
                          background: plan.recommended
                            ? "linear-gradient(135deg, rgba(92,107,192,0.12) 0%, rgba(121,134,203,0.08) 100%)"
                            : "rgba(92,107,192,0.06)",
                          backdropFilter: "blur(10px)",
                          border: "2px solid",
                          borderColor: plan.recommended
                            ? "#5C6BC0"
                            : "rgba(92,107,192,0.2)",
                          borderRadius: 2,
                          position: "relative",
                          overflow: "visible",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: isMobile ? "none" : "translateX(4px)",
                            boxShadow: plan.recommended
                              ? "0 8px 32px rgba(92,107,192,0.3)"
                              : "0 8px 32px rgba(92,107,192,0.15)",
                          },
                        }}
                      >
                        {(plan.recommended || plan.badge) && (
                          <Chip
                            label={plan.badge || "RECOMMENDED"}
                            sx={{
                              position: "absolute",
                              top: -10,
                              left: "50%",
                              transform: "translateX(-50%)",
                              background:
                                plan.badge === "BEST VALUE"
                                  ? "linear-gradient(135deg, #f9a825 0%, #f57f17 100%)"
                                  : "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.65rem",
                              height: 20,
                              boxShadow:
                                plan.badge === "BEST VALUE"
                                  ? "0 4px 12px rgba(249,168,37,0.4)"
                                  : "0 4px 12px rgba(92,107,192,0.4)",
                            }}
                          />
                        )}

                        <CardContent
                          sx={{
                            p: isMobile ? 1.5 : 2,
                            "&:last-child": { pb: isMobile ? 1.5 : 2 },
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mb: isMobile ? 1 : 1.5 }}
                          >
                            <Box
                              sx={{
                                width: isMobile ? 38 : 44,
                                height: isMobile ? 38 : 44,
                                background: plan.recommended
                                  ? "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)"
                                  : "linear-gradient(135deg, #6E7EC8 0%, #8895D0 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: plan.recommended
                                  ? "0 4px 16px rgba(92,107,192,0.4)"
                                  : "0 4px 16px rgba(110,126,200,0.3)",
                                flexShrink: 0,
                              }}
                            >
                              {React.createElement(plan.theme.icon, {
                                sx: {
                                  fontSize: isMobile ? 18 : 22,
                                  color: "white",
                                },
                              })}
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.7}
                                sx={{ mb: 0.3 }}
                              >
                                <Typography
                                  variant={isMobile ? "body1" : "h6"}
                                  fontWeight="bold"
                                  sx={{ color: "white", lineHeight: 1.1 }}
                                >
                                  {plan.name}
                                </Typography>
                                {plan.discountPercent > 0 && (
                                  <Chip
                                    label={`${plan.discountPercent}% OFF`}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: "0.58rem",
                                      fontWeight: "bold",
                                      background:
                                        "linear-gradient(135deg, #f9a825 0%, #f57f17 100%)",
                                      color: "white",
                                      "& .MuiChip-label": { px: 0.6 },
                                    }}
                                  />
                                )}
                              </Stack>

                              {/* ── Price display with asterisk ── */}
                              <PlanPriceDisplay
                                plan={plan}
                                hasRefCode={hasValidRefCode}
                                isMobile={isMobile}
                              />
                            </Box>
                          </Stack>

                          <Stack
                            spacing={1}
                            sx={{
                              mb: isMobile ? 1 : 1.5,
                              flex: 1,
                              justifyContent: "center",
                            }}
                          >
                            {plan.features.map((feature, idx) => (
                              <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center"
                                key={idx}
                              >
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: plan.recommended
                                      ? "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)"
                                      : "linear-gradient(135deg, #6E7EC8 0%, #8895D0 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Check
                                    sx={{
                                      fontSize: 11,
                                      color: "white",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  sx={{
                                    color: plan.recommended
                                      ? "#B8C1E8"
                                      : "#8895BE",
                                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {feature}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>

                          <Button
                            variant="contained"
                            fullWidth
                            size="medium"
                            disabled={isCurrent}
                            onClick={() =>
                              !isCurrent && handleSubscribeClick(plan)
                            }
                            sx={{
                              py: isMobile ? 1.3 : 1.2,
                              background: isCurrent
                                ? "rgba(255,255,255,0.15) !important"
                                : plan.recommended
                                  ? "linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)"
                                  : "linear-gradient(135deg, #6E7EC8 0%, #8895D0 100%)",
                              fontWeight: "bold",
                              fontSize: isMobile ? "0.75rem" : "0.78rem",
                              color: isCurrent
                                ? "rgba(255,255,255,0.6) !important"
                                : "white",
                              boxShadow: isCurrent
                                ? "none"
                                : plan.recommended
                                  ? "0 4px 16px rgba(92,107,192,0.4)"
                                  : "0 4px 16px rgba(110,126,200,0.3)",
                              cursor: isCurrent ? "default" : "pointer",
                              "&:hover": isCurrent
                                ? {}
                                : {
                                    background: plan.recommended
                                      ? "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)"
                                      : "linear-gradient(135deg, #8895D0 0%, #6E7EC8 100%)",
                                    transform: isMobile
                                      ? "none"
                                      : "translateY(-2px)",
                                    boxShadow: plan.recommended
                                      ? "0 6px 20px rgba(92,107,192,0.5)"
                                      : "0 6px 20px rgba(110,126,200,0.4)",
                                  },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {isCurrent ? "Current Plan" : "Subscribe Now"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>

            {/* ── Asterisk footnote ── */}
            <Box
              sx={{
                mt: 1.5,
                textAlign: "center",
                px: 1,
                pb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 243, 243, 0.88)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                }}
              >
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "rgba(248, 211, 0, 0.99)",
                    fontWeight: "900",
                    fontSize: "0.89rem",
                    mr: 0.3,
                  }}
                >
                  *
                </Typography>
                If you have a sales reference code, enter it at checkout to
                unlock a special discount.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionCard;