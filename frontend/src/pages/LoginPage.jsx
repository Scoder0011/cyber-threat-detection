import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Globe,
  Radio
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { Button } from "../components/common/Button";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithOAuth, isLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("alex.morgan@threatlens.sec");
  const [password, setPassword] = useState("••••••••••••");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email || !email.includes("@")) {
      errs.email = "Please enter a valid security operational email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        errs.fullName = "Full name is required for SOC audit logs.";
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isSignUp) {
      const res = await signUpWithEmail(email, password, fullName);
      if (!res.error) {
        navigate("/dashboard");
      } else {
        setErrors({ submit: res.error.message || "Failed to sign up" });
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (!res.error) {
        navigate("/dashboard");
      } else {
        setErrors({ submit: res.error.message || "Invalid login credentials" });
      }
    }
  };

  const handleOAuth = async (provider) => {
    const res = await signInWithOAuth(provider);
    if (!res.error) {
      navigate("/dashboard");
    } else {
      setErrors({ submit: res.error.message || `Failed to sign in with ${provider}` });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F6FA] dark:bg-[#0B0E14] text-slate-800 dark:text-[#E4E6EB] transition-colors duration-300 relative overflow-hidden">
      
      {/* Absolute top-right Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT HALF: BRANDED HIGH-TECH CYBER PANEL */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-[#0B1120] to-[#070A12] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        
        {/* Animated Background Cyber Mesh & Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-blob-float" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-blob-float [animation-delay:4s]" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none animate-blob-float [animation-delay:8s]" />

        {/* Ambient Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38BDF8 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* TOP BRAND LOGO */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  TheThirdEYE
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  ENTERPRISE SOC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Unified Autonomous Cyber Operations & Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE HERO CONTENT */}
        <div className="relative z-10 my-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-glow-blue backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GLOBAL THREAT MATRIX ONLINE • 99.99% DEFENSE RATIO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
            Real-time threat intelligence,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              unified.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
            Correlate ingress packets, track nation-state threat vectors in 3D cartography, and orchestrate zero-touch SOAR containment across 4,800+ endpoints.
          </p>

          {/* Mini Security Metrics Live Preview */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-2xl">
            <div className="p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SCORE</span>
              <span className="text-xl font-extrabold text-blue-400 font-mono">94/100</span>
            </div>
            <div className="p-2 border-x border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MITIGATED</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">17,483</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TELEMETRY</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">24h LIVE</span>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER BADGES */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-slate-800/80">
          <span>ISO 27001 • SOC2 TYPE II CERTIFIED</span>
          <span>BUILD: v4.8.2-SEC</span>
        </div>

      </div>

      {/* RIGHT HALF: CENTERED GLASSMORPHIС AUTH CARD */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
        
        {/* Subtle background ambient mesh */}
        <div className="w-full max-w-md relative z-10">
          
          {/* Glassmorphic Form Container */}
          <div className="bg-white dark:bg-[#1A1E27] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-8 sm:p-10 shadow-2xl dark:shadow-card-dark backdrop-blur-xl transition-all duration-300">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#E4E6EB] tracking-tight">
                {isSignUp ? "Create SOC Account" : "Welcome back"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isSignUp
                  ? "Provision your security clearance credentials to access TheThirdEYE."
                  : "Enter your verified security analyst credentials to access the console."}
              </p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#12151C] border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                        errors.fullName
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Security Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="analyst@threatlens.sec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#12151C] border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono ${
                      errors.email
                        ? "border-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Password
                  </label>
                  {!isSignUp && (
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password reset instructions have been dispatched to your verified security inbox.");
                      }}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#12151C] border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono ${
                      errors.password
                        ? "border-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#12151C] border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono ${
                        errors.confirmPassword
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Remember me Checkbox */}
              {!isSignUp && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember-me-cb"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me-cb" className="text-xs text-slate-600 dark:text-slate-400 select-none">
                    Remember my workstation token (30 days)
                  </label>
                </div>
              )}

              {/* Primary Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full justify-center shadow-lg shadow-blue-500/25 py-3 text-sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {isSignUp ? "Complete Enrollment & Launch SOC" : "Sign In to SOC Console"}
                </Button>
              </div>

            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#1A1E27] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                or continue with
              </span>
            </div>

            {/* OAuth Buttons (Google + GitHub) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Cloud</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("github")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current text-slate-800 dark:text-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub SSO</span>
              </button>
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {isSignUp ? (
                <>
                  Already hold an active SOC credential?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrors({});
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              ) : (
                <>
                  Don't have an analyst account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrors({});
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Enroll here
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
