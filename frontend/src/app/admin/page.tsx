"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  RefreshCw,
  Trophy,
  Clock,
} from "lucide-react";
import api from "@/lib/api";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review Action Modal
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"VERIFIED" | "CHANGES_REQUESTED" | "REJECTED">("VERIFIED");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/overview");
      if (res.data?.success) {
        setStats(res.data.stats);
        setInstitutions(res.data.institutions || []);
        setEvents(res.data.events || []);
        setPendingMatches(res.data.pendingMatches || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (id: string) => {
    setActionLoading(`inst-${id}`);
    try {
      const res = await api.put(`/admin/institution/${id}/verify`);
      if (res.data?.success) {
        setInstitutions((prev) =>
          prev.map((inst) =>
            inst.id === id ? { ...inst, isVerified: res.data.institution.isVerified } : inst
          )
        );
      }
    } catch (err) {
      console.error("Toggle inst verify failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateEvent = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    setActionLoading(`evt-${id}`);
    try {
      const res = await api.put(`/admin/event/${id}/status`, { status: nextStatus });
      if (res.data?.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e))
        );
      }
    } catch (err) {
      console.error("Event mod failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteMatchReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSubmittingReview(true);
    try {
      const res = await api.put(`/matches/${selectedMatch.id}/review`, {
        status: reviewDecision,
        decisionNotes,
        reviewerName: "Chief Sports Integrity Officer",
      });

      if (res.data?.success) {
        setSelectedMatch(null);
        setDecisionNotes("");
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Review action failed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading authorized reviewer portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SPORTRISE National Verification & Oversight Console</span>
            </div>
            <h1 className="text-3xl font-black text-white">Platform Reviewer Portal</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit institution badges, inspect submitted match evidence, and authorize official ranking calculations.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Institutions Registered
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats?.totalInstitutions || 0}</span>
              <span className="text-xs text-emerald-400 font-bold">
                ({stats?.verifiedInstitutions || 0} verified)
              </span>
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Matches Pending Review
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{stats?.pendingMatches || 0}</span>
              <span className="text-xs text-slate-400 font-bold">queue</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Verified Matches Ranked
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{stats?.verifiedMatches || 0}</span>
              <span className="text-xs text-slate-400 font-bold">official</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Open Disputes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-400">{stats?.openDisputes || 0}</span>
              <span className="text-xs text-slate-400 font-bold">reports</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Match Evidence Verification Queue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                Match Evidence & Scorecard Verification Queue
              </h2>
              <p className="text-xs text-slate-400">
                Inspect signed match sheets, scoreboard photos, and participant IDs before sanctioning results.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {pendingMatches.length} Awaiting Verification
            </span>
          </div>

          {pendingMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All match submissions are currently verified and up to date!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Match #</th>
                    <th className="py-3 px-3">Competition & Sport</th>
                    <th className="py-3 px-3">Submitting Institution</th>
                    <th className="py-3 px-3">Score & Outcome</th>
                    <th className="py-3 px-3">Evidence Attached</th>
                    <th className="py-3 px-3 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingMatches.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-3 font-mono font-bold text-orange-400">
                        {m.matchNumber}
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{m.competitionName}</p>
                        <p className="text-[10px] text-slate-400">{m.sport} • {m.matchFormat}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-200 block">{m.institution?.name}</span>
                        <span className="text-[10px] text-slate-400">{m.institution?.city}, {m.institution?.state}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{m.finalScore}</span>
                        <span className="text-[10px] text-emerald-400">Winner: {m.winner || "N/A"}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-blue-400 font-bold block">
                          {m._count?.evidences || 0} File(s)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m._count?.participants || 0} Athlete(s)
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/matches/${m.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300"
                            title="Inspect Scorecard"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedMatch(m);
                              setReviewDecision("VERIFIED");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow"
                          >
                            Review & Decide
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: Institution Verification Management */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                Schools & Colleges Verification Management
              </h2>
              <p className="text-xs text-slate-400">
                Grant or revoke official &ldquo;Institution Verified&rdquo; badge.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-bold">{institutions.length} Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Institution Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Matches Submitted</th>
                  <th className="py-3 px-3">Badge Status</th>
                  <th className="py-3 px-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{inst.name}</p>
                      <p className="text-[10px] text-slate-400">{inst.email}</p>
                    </td>
                    <td className="py-3 px-3">{inst.type}</td>
                    <td className="py-3 px-3">{inst.city}, {inst.state}</td>
                    <td className="py-3 px-3 font-bold text-orange-400">
                      {inst._count?.matchesSubmitted || 0}
                    </td>
                    <td className="py-3 px-3">
                      {inst.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleVerification(inst.id)}
                        disabled={actionLoading === `inst-${inst.id}`}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          inst.isVerified
                            ? "bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                            : "bg-sky-500 hover:bg-sky-600 text-white shadow"
                        }`}
                      >
                        {actionLoading === `inst-${inst.id}`
                          ? "Saving..."
                          : inst.isVerified
                          ? "Revoke Badge"
                          : "Verify Institution"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Decision Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
              <h3 className="text-lg font-bold text-white mb-1">
                Official Review Decision for {selectedMatch.matchNumber}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Tournament: <strong>{selectedMatch.competitionName}</strong> ({selectedMatch.sport})
              </p>

              <form onSubmit={handleExecuteMatchReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Decision
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewDecision("VERIFIED")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        reviewDecision === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      Approve & Rank
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewDecision("CHANGES_REQUESTED")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        reviewDecision === "CHANGES_REQUESTED"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      Request Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewDecision("REJECTED")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        reviewDecision === "REJECTED"
                          ? "bg-red-500/20 text-red-400 border-red-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Decision Notes & Feedback (Audited)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific justification or instructions for the submitting institution..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg"
                  >
                    {submittingReview ? "Recording Decision..." : "Confirm & Apply Decision"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
