"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "../../../lib/institution-context";
import api from "../../../lib/api";
import InstitutionSidebar from "../../../components/institution/InstitutionSidebar";
import {
  CalendarPlus,
  CalendarCheck,
  FileText,
  Users,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  UploadCloud,
  Trophy,
  Mail,
  X,
} from "lucide-react";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  draftEvents: number;
  totalRegistrations: number;
  pendingApplications: number;
}

export default function InstitutionDashboardPage() {
  const router = useRouter();
  const { institution, isLoading } = useInstitution();

  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    completedEvents: 0,
    draftEvents: 0,
    totalRegistrations: 0,
    pendingApplications: 0,
  });

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !institution) {
      router.push("/institution/login");
      return;
    }

    if (institution) {
      fetchDashboardData();
    }
  }, [institution, isLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/institutions/stats");
      if (res.data?.success) {
        setStats(res.data.stats);
        setRecentApplications(res.data.recentApplications || []);
        setRecentEvents(res.data.recentEvents || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (!institution && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading Institution Portal...</p>
        </div>
      </div>
    );
  }

  if (!institution) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <InstitutionSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {institution.name}
              </h1>
              {institution.isVerified ? (
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Institution
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(true)}
                  className="flex items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Verify Your Email
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {institution.type} &bull; {institution.city}, {institution.state} &bull; Coordinator: {institution.coordinatorName} ({institution.coordinatorPhone})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/institution/matches/submit"
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <UploadCloud className="w-5 h-5" />
              Submit Match Results
            </Link>
            <Link
              href="/institution/events/create"
              className="px-5 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-xl shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <CalendarPlus className="w-5 h-5" />
              Host an Event
            </Link>
            <Link
              href="/events"
              target="_blank"
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              Student View
            </Link>
          </div>
        </div>

        {/* Verify Your Email Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl flex-shrink-0 border border-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Institution Email: {institution.email}</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Check and manage email verification status for your registered institution account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowVerifyModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto flex-shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            Verify Your Email
          </button>
        </div>

        {/* Verify Email Modal with Exact Message */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">Email Verification</h3>
              <p className="text-xs text-slate-400 mt-1">
                {institution.email}
              </p>

              {/* Exact Required Message */}
              <div className="my-5 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm font-semibold shadow">
                Email verification will be available soon.
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Your institution profile for <span className="text-white font-bold">{institution.name}</span> currently has full administrative access to host events, manage registrations, and submit match scorecards.
              </p>

              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Total Events */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Events
            </span>
            <span className="text-2xl font-black text-white block mt-1">
              {stats.totalEvents}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">All Created</span>
          </div>

          {/* Upcoming Events (Blue) */}
          <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 text-center bg-blue-500/5">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              Upcoming
            </span>
            <span className="text-2xl font-black text-blue-400 block mt-1">
              {stats.upcomingEvents}
            </span>
            <span className="text-[10px] text-blue-300/70 block mt-0.5">Registration Open</span>
          </div>

          {/* Ongoing Events (Green) */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 text-center bg-emerald-500/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Ongoing
            </span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">
              {stats.ongoingEvents}
            </span>
            <span className="text-[10px] text-emerald-300/70 block mt-0.5">Currently Live</span>
          </div>

          {/* Completed Events (Gray) */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-black text-slate-300 block mt-1">
              {stats.completedEvents}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Concluded</span>
          </div>

          {/* Total Registrations (Purple/Indigo) */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 text-center bg-indigo-500/5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
              Registrations
            </span>
            <span className="text-2xl font-black text-indigo-300 block mt-1">
              {stats.totalRegistrations}
            </span>
            <span className="text-[10px] text-indigo-300/70 block mt-0.5">Students Applied</span>
          </div>

          {/* Pending Applications (Orange) */}
          <div className="bg-slate-900/80 border border-orange-500/30 rounded-2xl p-4 text-center bg-orange-500/5">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-2xl font-black text-orange-400 block mt-1">
              {stats.pendingApplications}
            </span>
            <span className="text-[10px] text-orange-300/70 block mt-0.5">Awaiting Action</span>
          </div>
        </div>

        {/* AI Scorecard & Results Verification Card */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0 border border-emerald-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Official Match Results & AI Scorecard Verification
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Anti-Fraud Enabled
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Submit completed fixture outcomes, upload official scorecards with SHA-256 tamper-detection, and trigger deterministic multi-match athlete ranking recalculations across India.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <Link
              href="/institution/matches/submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              Submit Results
            </Link>
            <Link
              href="/institution/matches"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              View Matches
            </Link>
          </div>
        </div>

        {/* 2-Column Section: Recent Applications & Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Recent Applications */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Recent Student Applications
              </h2>
              <Link
                href="/institution/applications"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All ({stats.totalRegistrations}) &rarr;
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No applications received yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Once your events are published, student applications will show here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {app.applicantName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({app.applicationNumber})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {app.event?.name} &bull; {app.institutionName}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                          app.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : app.status === "Rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : app.status === "Under Review"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                        }`}
                      >
                        {app.status}
                      </span>
                      <Link
                        href={`/institution/applications?id=${app.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Recent Events */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                Institution Events
              </h2>
              <Link
                href="/institution/events"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All ({stats.totalEvents}) &rarr;
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
                <CalendarPlus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No events published yet.</p>
                <Link
                  href="/institution/events/create"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[220px]">
                          {evt.name}
                        </span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-semibold border border-slate-800">
                          {evt.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(evt.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        &bull; {evt.venueName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-indigo-400 block">
                        {evt._count?.applications || 0} applications
                      </span>
                      <Link
                        href={`/events/${evt.id}`}
                        target="_blank"
                        className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 mt-0.5"
                      >
                        Public View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
