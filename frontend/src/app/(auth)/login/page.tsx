"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Award,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Please enter your Email or Athlete ID and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      if (res.data?.success) {
        login(res.data.token, res.data.user);
        router.push("/dashboard");
      } else {
        setError(res.data?.message || "Invalid credentials.");
      }
    } catch (err: any) {
      // Check if unverified
      const respEmail = err.response?.data?.email;
      const targetEmail = respEmail || (identifier.includes("@") ? identifier.trim().toLowerCase() : "");
      if (err.response?.status === 403 || err.message?.includes("verification") || err.message?.includes("OTP")) {
        router.push(`/verify-otp?email=${encodeURIComponent(targetEmail)}`);
        return;
      }
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Athlete Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Enter your Email or SportRise Athlete ID
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier: Email OR SportRise ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Email Address or Athlete ID
            </label>
            <input
              type="text"
              placeholder="e.g. SR-IND-26-ATH-10001 or athlete@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In to Dashboard
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {/* Register CTA */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an Athlete ID yet?{" "}
          <Link href="/register" className="font-bold text-orange-400 hover:text-orange-300">
            Register Athlete Now
          </Link>
        </p>
      </div>
    </div>
  );
}
