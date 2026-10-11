"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import {
  ShieldCheck,
  Mail,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Inbox,
} from "lucide-react";

function VerifyOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    athleteId: string;
    fullName: string;
  } | null>(null);

  // 10-minute expiry countdown timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const queryEmail = searchParams.get("email");
    const storedEmail = sessionStorage.getItem("sportrise_pending_email");
    const activeEmail = queryEmail || storedEmail || "";
    setEmail(activeEmail);
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input immediately
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when the 6th digit is entered
    if (value && index === 5) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pasted.length, 5);
    inputRefs.current[focusTarget]?.focus();

    if (pasted.length === 6) {
      verifyCode(pasted);
    }
  };

  const verifyCode = async (codeToVerify: string) => {
    if (!email) {
      setError("Missing email address. Please return to registration.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: codeToVerify,
      });

      if (res.data?.success) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f97316", "#ffffff", "#16a34a", "#eab308"],
        });

        const { token, user } = res.data;
        login(token, user);

        setSuccessInfo({
          athleteId: user.athleteId,
          fullName: user.fullName,
        });

        sessionStorage.removeItem("sportrise_pending_email");

        // Super fast redirection to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        setError(res.data?.message || "Invalid OTP code.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code sent to your email.");
      return;
    }
    verifyCode(fullCode);
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const res = await api.post("/auth/resend-otp", { email });
      if (res.data?.success) {
        setTimeLeft(600);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendMessage("A fresh verification code has been dispatched to your email address!");
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur text-center">
        {/* Header Icon */}
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Verify Email Address
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Your 6-digit verification code has been sent directly to:
        </p>
        <p className="text-sm font-semibold text-orange-400 mt-1 flex items-center justify-center gap-1.5 break-all">
          <Mail className="w-4 h-4 flex-shrink-0" />
          {email || "your registered email"}
        </p>

        {/* Real User Security Notice */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2.5 text-left text-xs text-slate-300">
          <Inbox className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Please check your <strong>inbox</strong> or <strong>spam folder</strong> to find your verification code.
          </span>
        </div>

        {/* Success Box */}
        {successInfo ? (
          <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Identity Confirmed!</h3>
            <p className="text-xs text-slate-300">
              Welcome, <strong className="text-white">{successInfo.fullName}</strong>.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 mt-2">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                Official SportRise Athlete ID
              </span>
              <span className="text-lg font-mono font-black text-white tracking-wider">
                {successInfo.athleteId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2">Opening Athlete Dashboard...</p>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend Notice */}
            {resendMessage && (
              <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-left">
                {resendMessage}
              </div>
            )}

            {/* 6-Digit Code Inputs */}
            <form onSubmit={handleVerify} className="mt-6 space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Expires in: {formatTimer(timeLeft)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timeLeft > 540}
                  className="font-bold text-orange-400 hover:text-orange-300 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  Resend Code
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || otpDigits.join("").length !== 6}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Confirm Verification Code
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading verification portal...
        </div>
      }
    >
      <VerifyOtpInner />
    </Suspense>
  );
}
