"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { useInstitution } from "@/lib/institution-context";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";

export default function InstitutionSettingsPage() {
  const { institution, logout } = useInstitution();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [instantSMS, setInstantSMS] = useState(true);
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Institution Settings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure tournament notifications, access controls, and organization preferences.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              Registration Alert Preferences
            </h2>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Email Registration Summaries</p>
                  <p className="text-[11px] text-slate-400">Receive email alerts whenever an athlete registers</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">SMS Updates for Coordinators</p>
                  <p className="text-[11px] text-slate-400">Instant SMS on quota full or schedule changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={instantSMS}
                  onChange={(e) => setInstantSMS(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Public Directory Listing</p>
                  <p className="text-[11px] text-slate-400">Display institution name in verified organizers registry</p>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfileVisible}
                  onChange={(e) => setPublicProfileVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-400" />
              Security & Credentials
            </h2>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Signed in as: <strong className="text-white">{institution?.email}</strong>
              </p>
              <p className="text-slate-400">
                Authorized Officer: <strong className="text-slate-200">{institution?.authorizedPersonName}</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/institution/profile"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
              >
                Edit Institution Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors"
              >
                Sign Out of Institution Portal
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-all"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
