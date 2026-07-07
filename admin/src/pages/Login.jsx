import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// internal
import useLoginSubmit from "@/hooks/useLoginSubmit";

const Login = () => {
  const { t } = useTranslation();
  const { onSubmit, register, handleSubmit, errors, loading } = useLoginSubmit();
  const [showPass, setShowPass] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow top-left */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          right: "-200px",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          margin: "0 16px",
          backgroundColor: "#0A0A0A",
          border: "1px solid rgba(212,175,55,0.15)",
          borderRadius: "20px",
          padding: "48px 40px",
          boxShadow:
            "0 0 0 1px rgba(212,175,55,0.05), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <img
            src="/rasaLogo.png"
            alt="RASA Store"
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              margin: "0 auto 20px",
              filter: "drop-shadow(0 0 12px rgba(212,175,55,0.4))",
            }}
          />
          {/* Gold divider line */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
              marginBottom: "24px",
            }}
          />
          {/* Eyebrow */}
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#D4AF37",
              marginBottom: "8px",
            }}
          >
            Admin Dashboard
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#ffffff",
              margin: 0,
            }}
          >
            RASA Store
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "6px",
            }}
          >
            Sign in to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              {/* Email icon */}
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.25)",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </span>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
                type="email"
                autoComplete="username"
                placeholder="admin@rasastore.com"
                id="login-email"
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: errors.email
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(212,175,55,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "5px" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              {/* Lock icon */}
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.25)",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                id="login-password"
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 42px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: errors.password
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(212,175,55,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {/* Eye toggle */}
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {showPass ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "5px" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "rgba(212,175,55,0.4)"
                : "linear-gradient(135deg, #D4AF37 0%, #B8962E 50%, #D4AF37 100%)",
              backgroundSize: "200% 200%",
              border: "none",
              borderRadius: "10px",
              color: "#000",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.1s, box-shadow 0.2s",
              boxShadow: loading ? "none" : "0 4px 20px rgba(212,175,55,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.boxShadow = "0 6px 28px rgba(212,175,55,0.5)";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = "0 4px 20px rgba(212,175,55,0.3)";
              e.target.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              if (!loading) e.target.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  style={{ animation: "spin 0.8s linear infinite" }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Forgot password */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            to="/forgot-password"
            style={{
              fontSize: "12px",
              color: "rgba(212,175,55,0.7)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(212,175,55,0.7)")}
          >
            Forgot your password?
          </Link>
        </div>

        {/* Bottom divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
            margin: "28px 0 20px",
          }}
        />

        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.05em",
          }}
        >
          © {new Date().getFullYear()} RASA Store. All rights reserved.
        </p>
      </div>

      {/* Spinner keyframes injected inline */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0f0f0f inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
      `}</style>
    </div>
  );
};

export default Login;
