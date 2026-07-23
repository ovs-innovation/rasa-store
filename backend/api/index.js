require("../config/env");
const { validateRequiredEnv, getPublicConfigStatus } = require("../config/validateEnv");

// Fail closed before Express boots — never run half-configured in production.
validateRequiredEnv({ exit: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const crypto = require("crypto");

const { connectDB } = require("../config/db");
const productRoutes = require("../routes/productRoutes");
const customerRoutes = require("../routes/customerRoutes");
const adminRoutes = require("../routes/adminRoutes");
const orderRoutes = require("../routes/orderRoutes");
const customerOrderRoutes = require("../routes/customerOrderRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const brandRoutes = require("../routes/brandRoutes");
const couponRoutes = require("../routes/couponRoutes");
const attributeRoutes = require("../routes/attributeRoutes");
const settingRoutes = require("../routes/settingRoutes");
const currencyRoutes = require("../routes/currencyRoutes");
const languageRoutes = require("../routes/languageRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const shiprocketRoutes = require("../routes/shiprocketRoutes");
const taxRoutes = require("../routes/taxRoutes");
const reviewRoutes = require("../routes/reviewRoutes");
const faqRoutes = require("../routes/faqRoutes");
const testimonialRoutes = require("../routes/testimonialRoutes");
const locationRoutes = require("../routes/locationRoutes");
const pushNotificationRoutes = require("../routes/pushNotificationRoutes");
const customerNotificationRoutes = require("../routes/customerNotificationRoutes");
const webhookRoutes = require("../routes/webhookRoutes");
const paymentRoutes = require("../modules/payment/routes/paymentRoutes");
const {
  handlePhonePeWebhook,
} = require("../modules/payment/controller/paymentController");
const { createCorsOptions } = require("../middleware/corsConfig");
const {
  errorHandler,
  notFoundHandler,
} = require("../middleware/errorHandler");
const { initSentry } = require("../lib/monitoring/sentry");

connectDB().catch((err) => {
  console.error(
    "⚠️  MongoDB connection failed — server will still start but DB operations will fail.",
    err.message,
  );
});
const app = express();

app.set("trust proxy", 1);

// Security headers first
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // API-only; storefront CSP is frontend's job
  }),
);

// Optional Sentry (enabled only when SENTRY_DSN is set)
initSentry(app);

// CORS whitelist (no "*" in production)
const corsOptions = createCorsOptions();
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Attach correlation id to every request
app.use((req, res, next) => {
  const incoming = req.headers["x-correlation-id"];
  req.correlationId =
    (typeof incoming === "string" && incoming.trim()) ||
    `req_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
  res.setHeader("X-Correlation-Id", req.correlationId);
  next();
});

app.get("/", (req, res) => {
  res.send("App works properly!");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    time: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

/**
 * Non-secret config probe for deploy verification / load balancers.
 * Never returns credentials.
 */
app.get("/api/system/config", (req, res) => {
  const status = getPublicConfigStatus();
  res.json({
    phonepeConfigured: status.phonepeConfigured,
    resendConfigured: status.resendConfigured,
    smtpConfigured: status.smtpConfigured,
  });
});

app.get("/o/:id", (req, res) => {
  const frontendBaseUrl = (
    process.env.FRONTEND_URL ||
    process.env.STORE_URL ||
    "http://localhost:3000"
  )
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");
  return res.redirect(302, `${frontendBaseUrl}/order/${req.params.id}`);
});

app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/order", customerOrderRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/shiprocket", shiprocketRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/push-notification", pushNotificationRoutes);
app.use("/api/customer-notifications", customerNotificationRoutes);
app.use("/api/webhooks", webhookRoutes);
app.post("/api/webhooks/phonepe", handlePhonePeWebhook);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

app.use("/static", express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use. Stop the other backend process first:\n` +
        `  netstat -ano | findstr :${PORT}\n` +
        `  taskkill /PID <pid> /F\n` +
        `Then run: npm run dev\n`,
    );
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
