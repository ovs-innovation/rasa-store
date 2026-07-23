const path = require("path");
const fs = require("fs");

/**
 * Production-safe CORS whitelist.
 * Never allows "*" when NODE_ENV/PHONEPE_ENV is production.
 */
const buildAllowedOrigins = () => {
  const fromEnv = [
    process.env.FRONTEND_URL,
    process.env.STORE_URL,
    process.env.ADMIN_URL,
    ...(String(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)),
  ].filter(Boolean);

  const localDev = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4100",
    "http://127.0.0.1:4100",
    "http://localhost:5055",
    "http://127.0.0.1:5055",
  ];

  const isProd =
    String(process.env.NODE_ENV || "").toLowerCase() === "production" ||
    String(process.env.PHONEPE_ENV || "").toLowerCase() === "production";

  if (isProd) {
    const origins = [...new Set(fromEnv.map((o) => o.replace(/\/+$/, "")))];
    // Always allow therasastore if not listed
    if (!origins.some((o) => o.includes("therasastore"))) {
      origins.push("https://therasastore.in", "https://www.therasastore.in");
    }
    return origins;
  }

  return [...new Set([...fromEnv, ...localDev].map((o) => o.replace(/\/+$/, "")))];
};

const createCorsOptions = () => {
  const allowedOrigins = buildAllowedOrigins();

  return {
    origin(origin, callback) {
      // Allow non-browser / same-origin / webhooks (no Origin header)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/+$/, "");
      const ok = allowedOrigins.some(
        (o) => normalized === o || normalized.startsWith(o)
      );

      if (ok) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Correlation-Id",
    ],
    exposedHeaders: ["X-Correlation-Id"],
  };
};

module.exports = {
  buildAllowedOrigins,
  createCorsOptions,
};
