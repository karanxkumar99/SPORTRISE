"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useInstitution } from "../../../lib/institution-context";
import api from "../../../lib/api";
import { InstitutionSidebar } from "../../../components/institution/InstitutionSidebar";
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  Search,
} from "lucide-react";

interface MatchItem {
  id: string;
  matchNumber: string;
  sport: string;
  competitionName: string;
  opponentName?: string;
  venue: string;
  matchDate: string;
  matchFormat: string;
  finalScore: string;
  winner?: string;
  resultSummary?: string;
  status: string;
  rejectionReason?: string;
  changeRequestNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  _count: {
    participants: number;
    evidences: number;
    disputes: number;
  };
}

export default function InstitutionMatchesPage() {
  const { institution } = useInstitution();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [institution, statusFilter]);

  const fetchMatches = async () => {
    if (!institution) return;
    setLoading(true);
    try {
      const params: any = { instituteId: institution.id };
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/matches", { params });
      if (res.data?.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) =>
    searchQuery
      ? m.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.matchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sport.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Ranked
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" /> Under Verification
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock className="w-3.5 h-3.5" /> In Official Review
          </span>
        );
      case "CHANGES_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Disputed Result
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Match Results & Evidence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Match Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Submit sanctioned match scorecards and evidence to update official athlete rankings.
            </p>
          </div>

          <Link
            href="/institution/matches/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Submit Match Scorecard
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tournament, match #, sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["All", "SUBMITTED", "VERIFIED", "CHANGES_REQUESTED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {st === "All" ? "All Submissions" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Match List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading submitted matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Match Submissions Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              When your school or college completes a sports tournament, submit the official match scorecard and supporting evidence here to feed into national rankings.
            </p>
            <Link
              href="/institution/matches/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow"
            >
              <Plus className="w-4 h-4" />
              Submit First Match
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                        {match.matchNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                        {match.sport}
                      </span>
                      <span className="text-xs text-slate-400">{match.matchFormat}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{match.competitionName}</h3>
                    {match.opponentName && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        vs <strong className="text-slate-200">{match.opponentName}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">{getStatusBadge(match.status)}</div>
                </div>

                {/* Score & Venue Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-850 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Official Score</span>
                    <strong className="text-white text-sm font-black">{match.finalScore}</strong>
                    {match.winner && (
                      <p className="text-[11px] text-emerald-400 mt-0.5">Winner: {match.winner}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Venue & Date</span>
                    <div className="flex items-center gap-1 text-slate-300 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(match.matchDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Verification Evidence</span>
                    <span className="text-slate-300 mt-0.5 block">
                      {match._count.participants} Athlete(s) • {match._count.evidences} Evidence File(s)
                    </span>
                  </div>
                </div>

                {/* Feedback Alerts if any */}
                {match.changeRequestNotes && match.status === "CHANGES_REQUESTED" && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Reviewer Feedback:</strong> {match.changeRequestNotes}
                    </div>
                  </div>
                )}

                {match.rejectionReason && match.status === "REJECTED" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 mb-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Rejection Reason:</strong> {match.rejectionReason}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500">
                    {match.reviewedBy ? `Reviewed by ${match.reviewedBy}` : "Pending official reviewer inspection"}
                  </span>
                  <Link
                    href={`/matches/${match.id}`}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    <span>View Public Scorecard & Evidence</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
