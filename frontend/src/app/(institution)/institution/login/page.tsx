"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "../../../../lib/institution-context";
import api from "../../../../lib/api";
import {
  School,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function InstitutionLoginPage() {
  const router = useRouter();
  const { login } = useInstitution();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your institution email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/institutions/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data?.success) {
        login(res.data.token, res.data.institution);
        router.push("/institution/dashboard");
      } else {
        setError(res.data?.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login fill
  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Institution@2026");
    setError(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Institution Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            School, College & University Event Administration
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Institution Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. sports@dpsrkp.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Open Institution Dashboard
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-semibold text-blue-400">
              <Zap className="w-3.5 h-3.5" /> 1-Click Demo Accounts:
            </span>
            <span className="text-[10px] text-slate-500">(Pass: Institution@2026)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("sports@dpsrkp.net")}
              className="text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 transition-colors"
            >
              <strong className="block text-white truncate">DPS R.K. Puram</strong>
              <span className="text-[10px] text-blue-400">School (Delhi)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("sportsboard@ststephens.edu")}
              className="text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 transition-colors"
            >
              <strong className="block text-white truncate">St. Stephen&apos;s</strong>
              <span className="text-[10px] text-emerald-400">College (Delhi)</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          New School or College?{" "}
          <Link href="/institution/register" className="font-bold text-blue-400 hover:text-blue-300">
            Register Institution
          </Link>
        </p>
      </div>
    </div>
  );
}
