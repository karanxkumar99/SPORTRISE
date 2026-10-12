"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import StateDistrictSelector from "../../../components/StateDistrictSelector";
import { OLYMPIC_SPORTS } from "../../../data/olympic-sports";
import {
  User,
  Mail,
  Phone,
  Lock,
  Award,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [sport, setSport] = useState("Athletics");
  const [ageCategory, setAgeCategory] = useState("U-19");
  const [gender, setGender] = useState("Male");

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client validation
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    const cleanMobile = mobile.replace(/[\s-]/g, "");
    const mobileRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    if (!cleanMobile) {
      errors.mobile = "Mobile number is required.";
    } else if (!mobileRegex.test(cleanMobile)) {
      errors.mobile = "Enter a valid 10-digit Indian mobile number (+91 or 10 digits).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password) {
      errors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      errors.password =
        "Min 8 characters, at least 1 uppercase letter and 1 special character.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!state) {
      errors.state = "Please select your state/UT.";
    }

    if (!district) {
      errors.district = "Please select your district.";
    }

    if (!sport) {
      errors.sport = "Please choose your primary Olympic sport.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName,
        mobile,
        email,
        password,
        confirmPassword,
        state,
        district,
        sport,
        ageCategory,
        gender,
      };

      const res = await api.post("/auth/register", payload);

      if (res.data?.success) {
        sessionStorage.setItem("sportrise_pending_email", email.trim().toLowerCase());
        sessionStorage.setItem("sportrise_pending_name", fullName.trim());

        router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        setError(res.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Athlete Registration & Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Claim your official SportRise Athlete ID &bull; Valid across all 36 Indian States & UTs
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Personal Info */}
          <div>
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
              1. Personal Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    fieldErrors.fullName ? "border-red-500" : "border-slate-800 focus:border-orange-500"
                  } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Mobile Number (Indian) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Mobile Number (Indian +91) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    fieldErrors.mobile ? "border-red-500" : "border-slate-800 focus:border-emerald-500"
                  } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                />
                {fieldErrors.mobile && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.mobile}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Email Address (For OTP Verification) <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-950 border ${
                  fieldErrors.email ? "border-red-500" : "border-slate-800 focus:border-sky-500"
                } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Password <span className="text-orange-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 special"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    fieldErrors.password ? "border-red-500" : "border-slate-800 focus:border-amber-500"
                  } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Confirm Password <span className="text-orange-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    fieldErrors.confirmPassword ? "border-red-500" : "border-slate-800 focus:border-amber-500"
                  } text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: State & District Selector */}
          <div className="pt-2 border-t border-slate-800">
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
              2. Geographic Affiliation (All 28 States & 8 UTs)
            </h2>
            <StateDistrictSelector
              selectedState={state}
              selectedDistrict={district}
              onStateChange={setState}
              onDistrictChange={setDistrict}
              errorState={fieldErrors.state}
              errorDistrict={fieldErrors.district}
            />
          </div>

          {/* Section: Olympic Sport & Category */}
          <div className="pt-2 border-t border-slate-800">
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
              3. Olympic Discipline & Age Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Olympic Sport Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Olympic Sport <span className="text-orange-500">*</span>
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  {OLYMPIC_SPORTS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Age Category
                </label>
                <select
                  value={ageCategory}
                  onChange={(e) => setAgeCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="U-14">Under-14 (Sub-Junior)</option>
                  <option value="U-17">Under-17 (Youth)</option>
                  <option value="U-19">Under-19 (Junior)</option>
                  <option value="Senior">Senior (Open Category)</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unique Athlete ID preview banner */}
          <div className="p-3.5 bg-slate-950/80 border border-orange-500/30 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">Unique Athlete ID Preview:</span>{" "}
              Upon submission, you will be issued a format-compliant ID{" "}
              <code className="text-orange-400 font-mono font-bold">
                SR-IND-26-XXX-#####
              </code>{" "}
              verified via email OTP.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Athlete ID & Sending OTP...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send 6-Digit Verification Code
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300">
            Sign In with Email or Athlete ID
          </Link>
        </p>
      </div>
    </div>
  );
}
