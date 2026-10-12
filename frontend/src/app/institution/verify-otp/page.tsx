"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useInstitution } from "@/lib/institution-context";
import {
  School,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

function InstitutionVerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useInstitution();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`inst-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`inst-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      const lastInput = document.getElementById("inst-otp-5");
      lastInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Institution email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/institutions/verify-otp", {
        email,
        otp: fullCode,
      });

      if (res.data?.success) {
        setSuccess(true);
        if (res.data?.token && res.data?.institution) {
          login(res.data.token, res.data.institution);
        }
        setTimeout(() => {
          router.push("/institution/dashboard");
        }, 1800);
      } else {
        setError(res.data?.message || "Verification failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setError(null);
    setInfoMessage(null);
    setResendLoading(true);

    try {
      const res = await api.post("/institutions/resend-otp", { email });
      if (res.data?.success) {
        setInfoMessage("A fresh 6-digit code has been dispatched to your institution email.");
        setResendCooldown(60);
      } else {
        setError(res.data?.message || "Failed to resend code.");
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || "Cooldown active. Please wait.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to resend code.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verify Institution Email
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            We dispatched a 6-digit verification code to
          </p>
          <p className="text-sm font-bold text-blue-400 mt-0.5 truncate">{email || "your registered email"}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Email Verified Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1">Redirecting you to Institution Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {!searchParams.get("email") && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sports@institution.edu"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`inst-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white rounded-xl focus:outline-none transition-all"
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Valid for 10 minutes • 5 attempts permitted
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Confirm Verification
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
                className="font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:hover:text-blue-400 flex items-center gap-1"
              >
                {resendLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-850 text-center">
          <Link href="/institution/login" className="text-xs text-slate-400 hover:text-slate-300">
            &larr; Back to Institution Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InstitutionVerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading verification...
        </div>
      }
    >
      <InstitutionVerifyOtpContent />
    </Suspense>
  );
}
