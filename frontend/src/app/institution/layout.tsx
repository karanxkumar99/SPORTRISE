"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useInstitution } from "@/lib/institution-context";
import { ShieldAlert, ArrowLeft, LogOut, School, Lock } from "lucide-react";

export default function InstitutionRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutAthlete } = useAuth();
  const { institution, isLoading } = useInstitution();

  const isPublicInstitutionRoute =
    pathname === "/institution/login" ||
    pathname === "/institution/register" ||
    pathname === "/institution/verify-otp";

  // Check if Athlete is trying to access protected institution administration
  if (user && !institution) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Access Restricted &bull; Role Authorization
          </span>

          <h2 className="text-2xl font-black text-white mt-3">
            Institution Portal Access Denied
          </h2>

          <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
            <p className="text-xs text-slate-300">
              You are currently signed in as an Athlete:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{user.fullName}</p>
                <p className="text-[10px] text-orange-400 font-mono">{user.athleteId}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-bold">
                Athlete Profile
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              The Institution Portal is restricted to verified educational institutions, colleges, and sports academies. Athlete accounts cannot access institution administration pages or manage tournaments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Athlete Dashboard
            </Link>
            <button
              onClick={() => {
                logoutAthlete();
                router.push("/institution/login");
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Athlete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If loading institution session on private routes
  if (isLoading && !isPublicInstitutionRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Verifying Institution Authorization...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
