/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";

type AuthMode = "signin" | "signup" | "forgot";

function sanitizeAuthError(err: any): string {
  const msg = typeof err === 'string' ? err : err?.message || '';
  if (!msg) return 'Authentication encountered a temporary issue. Please try again.';
  if (
    msg.includes('<!doctype') ||
    msg.includes('Unexpected token') ||
    msg.includes('not valid JSON') ||
    msg.includes('502') ||
    msg.includes('503')
  ) {
    return 'Authentication service momentarily reconnecting. You can sign in smoothly.';
  }
  return msg;
}

export const AuthPage: React.FC = () => {
  const { signIn, signUp, requestPasswordReset, resetPassword, showToast } =
    useApp();

  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("forgot")) return "forgot";
      if (hash.includes("signup")) return "signup";
    }
    return "signin";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password flow
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("forgot")) {
        setMode("forgot");
        setError(null);
      } else if (hash.includes("signup")) {
        setMode("signup");
        setError(null);
      } else if (hash.includes("signin") || hash === "" || hash === "#") {
        setMode("signin");
        setError(null);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(sanitizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(password);
    const score = [hasUpper, hasLower, hasNumberOrSpecial].filter(
      Boolean,
    ).length;

    if (score < 3) {
      setError(
        "Password must contain uppercase, lowercase, and a number/special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password, confirmPassword);
    } catch (err: any) {
      setError(sanitizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSuccessMessage(res.message);
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      setResetStep(2);
      showToast({
        title: "Reset Code Dispatched",
        description: "Check your code below to update your password.",
        type: "info",
      });
    } catch (err: any) {
      setError(sanitizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resetCode || !newPassword) {
      setError("Please enter the reset code and your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const msg = await resetPassword(email, resetCode, newPassword);
      showToast({
        title: "Password Updated",
        description: msg,
        type: "success",
      });
      setMode("signin");
      setPassword(newPassword);
      setSuccessMessage("Password reset successfully. You may now sign in.");
      setResetStep(1);
    } catch (err: any) {
      setError(sanitizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoSupervisor = () => {
    setMode("signin");
    setEmail("nitinsingla256@gmail.com");
    setPassword("");
    setSuccessMessage("Admin email loaded. Enter your secure password.");
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 text-gray-900 overflow-hidden">
      {/* Left Column - Marketing/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-1/2 relative bg-gray-50 px-12 xl:px-24 py-16 justify-between border-r border-gray-200">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm relative">
            <span className="font-serif text-lg font-bold tracking-widest text-gray-900">
              PN
            </span>
          </div>
          <span className="font-serif text-xl tracking-[0.2em] font-semibold uppercase">
            PN
          </span>
        </div>

        {/* Hero Content */}
        <div className="max-w-md mt-12">
          <h1 className="text-4xl xl:text-5xl font-serif text-gray-900 leading-tight mb-4">
            Your Wardrobe.
            <br />
            Reimagined by{" "}
            <span className="text-emerald-500 font-sans font-semibold">AI</span>
            .
          </h1>
          <p className="text-gray-500 mb-10 text-base">
            Upload what you own. Let AI understand your wardrobe and create
            outfits that actually make sense for you.
          </p>

          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 shadow-xl mb-12 border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1fac08c044?auto=format&fit=crop&q=80&w=1000"
              alt="Curated Wardrobe"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <Sparkles className="w-5 h-5 text-emerald-500 mb-2" />
              <h3 className="text-xs font-semibold text-gray-900 mb-1">
                AI-Powered
                <br />
                Identification
              </h3>
            </div>
            <div>
              <UserIcon className="w-5 h-5 text-emerald-500 mb-2" />
              <h3 className="text-xs font-semibold text-gray-900 mb-1">
                Smart Outfit
                <br />
                Recommendations
              </h3>
            </div>
            <div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
              <h3 className="text-xs font-semibold text-gray-900 mb-1">
                Personal Style
                <br />
                Learning
              </h3>
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 relative h-screen overflow-y-auto">
        <div className="w-full max-w-[420px] py-12">
          {/* Mobile-only Branding Header */}
          <div className="flex lg:hidden flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm mb-3">
              <span className="font-serif text-xl font-bold tracking-widest text-gray-900">
                PN
              </span>
            </div>
            <h1 className="text-xl font-serif tracking-[0.25em] text-gray-900 font-semibold uppercase">
              PN
            </h1>
          </div>

          {/* Auth Box Container */}
          <div>
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ================= SIGN IN MODE ================= */}
              {mode === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                      Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      Log in to your account
                    </p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 bg-white cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 transition">
                          Remember me
                        </span>
                      </label>
                      <a
                        href="#forgot-password"
                        id="forgot-password-link"
                        role="link"
                        aria-label="Forgot password?"
                        data-testid="forgot-password-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError(null);
                          setMode("forgot");
                          if (typeof window !== "undefined") {
                            window.location.hash = "forgot-password";
                          }
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                      >
                        {loading ? "Authenticating..." : "Log In"}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 text-center pt-6">
                    <p className="text-sm text-gray-500">
                      Don't have an account?{" "}
                      <a
                        href="#signup"
                        id="signup-link"
                        role="link"
                        data-testid="signup-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError(null);
                          setMode("signup");
                          if (typeof window !== "undefined") {
                            window.location.hash = "signup";
                          }
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                      >
                        Sign up
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ================= SIGN UP MODE ================= */}
              {mode === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      Start your style journey today.
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength and Requirements */}
                      {password && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((step) => {
                              let color = "bg-gray-200";
                              const hasLength = password.length >= 8;
                              const hasUpper = /[A-Z]/.test(password);
                              const hasLower = /[a-z]/.test(password);
                              const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(
                                password,
                              );
                              const score = [
                                hasLength,
                                hasUpper,
                                hasLower,
                                hasNumberOrSpecial,
                              ].filter(Boolean).length;

                              if (score >= step) {
                                if (score <= 2) color = "bg-rose-500";
                                else if (score === 3) color = "bg-amber-500";
                                else color = "bg-emerald-500";
                              }

                              return (
                                <div
                                  key={step}
                                  className={`h-1 w-full rounded-full ${color} transition-colors duration-300`}
                                />
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-gray-500 grid grid-cols-2 gap-1 mt-1">
                            <span
                              className={
                                password.length >= 8 ? "text-emerald-600" : ""
                              }
                            >
                              ✓ Min 8 characters
                            </span>
                            <span
                              className={
                                /[A-Z]/.test(password) ? "text-emerald-600" : ""
                              }
                            >
                              ✓ Uppercase letter
                            </span>
                            <span
                              className={
                                /[a-z]/.test(password) ? "text-emerald-600" : ""
                              }
                            >
                              ✓ Lowercase letter
                            </span>
                            <span
                              className={
                                /[0-9!@#$%^&*]/.test(password)
                                  ? "text-emerald-600"
                                  : ""
                              }
                            >
                              ✓ Number / Special
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex items-start pt-2">
                      <label className="flex items-start gap-2 cursor-pointer group mt-1">
                        <input
                          type="checkbox"
                          required
                          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 bg-white cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 transition leading-snug">
                          I agree to the{" "}
                          <span className="text-emerald-600 hover:underline">
                            Terms & Conditions
                          </span>{" "}
                          and{" "}
                          <span className="text-emerald-600 hover:underline">
                            Privacy Policy
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                      >
                        {loading ? "Creating Account..." : "Create Account"}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 text-center pt-6">
                    <p className="text-sm text-gray-500">
                      Already have an account?{" "}
                      <a
                        href="#signin"
                        id="login-link"
                        role="link"
                        data-testid="login-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError(null);
                          setMode("signin");
                          if (typeof window !== "undefined") {
                            window.location.hash = "signin";
                          }
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                      >
                        Log in
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ================= FORGOT PASSWORD ================= */}
              {mode === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                      Recover Access
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      {resetStep === 1
                        ? "Enter your email to receive a secure recovery code."
                        : "Enter the code sent to your email and a new password."}
                    </p>
                  </div>

                  {resetStep === 1 ? (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                      </div>

                      <div className="pt-4 flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                        >
                          {loading ? "Sending..." : "Send Recovery Code"}
                        </button>

                        <a
                          href="#signin"
                          id="back-to-login-link"
                          role="link"
                          onClick={(e) => {
                            e.preventDefault();
                            setError(null);
                            setMode("signin");
                            if (typeof window !== "undefined") {
                              window.location.hash = "signin";
                            }
                          }}
                          className="w-full bg-transparent hover:bg-gray-50 text-gray-500 border border-gray-200 font-medium h-12 rounded-xl transition flex items-center justify-center cursor-pointer"
                        >
                          Cancel
                        </a>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleConfirmReset} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Recovery code
                        </label>
                        <input
                          type="text"
                          required
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          New password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                        >
                          {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetStep(1);
                            setResetCode("");
                          }}
                          className="w-full bg-transparent hover:bg-gray-50 text-gray-500 border border-gray-200 font-medium h-12 rounded-xl transition flex items-center justify-center"
                        >
                          Back to Email
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 pt-6 flex justify-between items-center text-[10px] text-gray-400 max-w-[420px] mx-auto w-full">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure
                & Private
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> AI
                Personalization
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoSupervisor}
              className="hover:text-emerald-500 transition-colors underline decoration-dotted"
            >
              Demo Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
