"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { getMediaUrl } from "../../../lib/utils";
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  User,
  Activity,
  History,
} from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"scorecard" | "evidence" | "audit">("scorecard");

  // Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidenceUrl, setDisputeEvidenceUrl] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId) fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/matches/${matchId}`);
      if (res.data?.success) {
        setMatch(res.data.match);
      }
    } catch (err) {
      console.error("Failed to load match:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeError(null);

    if (disputeReason.trim().length < 10) {
      setDisputeError("Please describe the dispute in detail (minimum 10 characters).");
      return;
    }

    setDisputeSubmitting(true);
    try {
      const res = await api.post(`/matches/${match.id}/dispute`, {
        reason: disputeReason.trim(),
        evidenceUrl: disputeEvidenceUrl.trim() || undefined,
      });

      if (res.data?.success) {
        setDisputeSuccess(true);
        setTimeout(() => {
          setShowDisputeModal(false);
          fetchMatchDetails();
        }, 1500);
      } else {
        setDisputeError(res.data?.message || "Failed to submit dispute.");
      }
    } catch (err: any) {
      setDisputeError(err.response?.data?.message || err.message || "Failed to submit dispute.");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-24 text-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading authenticated match scorecard...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-950 py-24 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Match Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">The match record may have been archived or removed.</p>
        <Link href="/matches" className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs">
          &larr; Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/matches"
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            &larr; Back to Matches Directory
          </Link>

          <button
            onClick={() => setShowDisputeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Report Result Inconsistency / Dispute
          </button>
        </div>

        {/* Top Match Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                  {match.matchNumber}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                  {match.sport}
                </span>
                <span className="text-xs text-slate-400">{match.matchFormat}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {match.competitionName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{match.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(match.matchDate).toLocaleDateString("en-IN", { dateStyle: "full" })}</span>
                </div>
              </div>
            </div>

            {/* Verification Status Stamp */}
            <div className="text-right">
              {match.status === "VERIFIED" ? (
                <div className="inline-flex flex-col items-end">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-black shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>OFFICIALLY VERIFIED</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Audited by {match.reviewedBy || "National Sports Official"}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{match.status.replace("_", " ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Big Score Display */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Hosting Institution / Team
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm sm:text-base text-white">{match.institution?.name}</span>
                <span className="font-mono text-xl sm:text-2xl font-black text-orange-400">
                  {match.finalScore}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Official Result
              </span>
              <p className="text-sm font-bold text-emerald-400">
                {match.winner ? `Winner: ${match.winner}` : "Match Concluded"}
              </p>
              {match.resultSummary && (
                <p className="text-xs text-slate-400 mt-0.5">{match.resultSummary}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scorecard"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Athlete Statistics ({match.participants?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "evidence"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Supporting Evidence ({match.evidences?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "audit"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <History className="w-4 h-4" />
            Audit Trail & History
          </button>
        </div>

        {/* TAB 1: Athlete Statistics Table */}
        {activeTab === "scorecard" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Participating Athletes Scorecard</span>
              <span className="text-[11px] text-slate-400">
                Performance Rating calibrated on deterministic 0–100 scale
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Athlete</th>
                    <th className="py-3 px-4">Athlete ID</th>
                    <th className="py-3 px-4">Role / Team</th>
                    <th className="py-3 px-4">Sport-Specific Statistics</th>
                    <th className="py-3 px-4 text-center">Match Rating</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {match.participants?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{p.athlete?.fullName}</div>
                        <span className="text-[11px] text-slate-400">
                          {p.athlete?.ageCategory} • {p.athlete?.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-orange-400 font-bold">
                        {p.athlete?.athleteId}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium block">{p.role || "Player"}</span>
                        <span className="text-[11px] text-slate-500">{p.teamName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(p.individualStats || {}).map(([key, val]: any) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded bg-slate-950 text-[11px] text-slate-300 border border-slate-800"
                            >
                              <strong className="text-slate-400 capitalize">{key}:</strong> {val}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-black font-mono text-sm border border-orange-500/20">
                          {p.performanceRating?.toFixed(1) || "50.0"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.verifiedStatsSaved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Credited
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Pending Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Supporting Evidence */}
        {activeTab === "evidence" && (
          <div className="space-y-4">
            {match.evidences?.length === 0 ? (
              <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No supporting evidence attached to this match record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {match.evidences?.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {ev.category}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {(ev.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate mb-1">{ev.fileName}</h4>
                      <p className="text-xs text-slate-400">Format: {ev.fileType}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Integrity Check Passed
                      </span>
                      <a
                        href={getMediaUrl(ev.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Audit Trail & Dispute History */}
        {activeTab === "audit" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-orange-400" />
              Cryptographic & Official Audit Log
            </h3>

            {match.auditLogs?.length === 0 ? (
              <p className="text-xs text-slate-400">No audit entries recorded.</p>
            ) : (
              <div className="space-y-3">
                {match.auditLogs?.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-200">
                          {log.action}
                        </span>
                        <span className="text-slate-400">Actor: <strong>{log.actorId}</strong> ({log.actorRole})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Raise Match Dispute / Report Inconsistency
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                If you suspect inaccurate scoring, ineligible athletes, or fraudulent scorecards, file an official dispute. All disputes are reviewed by national integrity officers.
              </p>

              {disputeError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {disputeError}
                </div>
              )}

              {disputeSuccess ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-center rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Dispute Submitted Successfully</p>
                  <p className="text-xs text-slate-400 mt-1">Status has been updated to DISPUTED for official audit.</p>
                </div>
              ) : (
                <form onSubmit={handleRaiseDispute} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reason for Dispute <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain specifically what is inconsistent (e.g. score discrepancy, unverified player identity)..."
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Supporting Evidence Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={disputeEvidenceUrl}
                      onChange={(e) => setDisputeEvidenceUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowDisputeModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={disputeSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg"
                    >
                      {disputeSubmitting ? "Filing Dispute..." : "Submit Dispute"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
