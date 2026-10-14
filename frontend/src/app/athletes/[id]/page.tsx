"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Share2,
  Copy,
  ExternalLink,
  Activity,
  TrendingUp,
  FileText,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface MatchEvidence {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  category: string;
  sha256Hash?: string;
  ocrStatus?: string;
  verificationFlag: string;
}

interface MatchParticipation {
  id: string;
  teamName: string | null;
  role: string | null;
  position: number | null;
  placement: string | null;
  disqualified: boolean;
  individualStats: string;
  performanceRating: number | null;
  match: {
    id: string;
    matchNumber: string;
    sport: string;
    competitionName: string;
    venue: string;
    matchDate: string;
    finalScore: string;
    winner: string | null;
    status: string;
    institution?: {
      name: string;
      city: string;
      state: string;
      logo?: string;
    };
    evidences?: MatchEvidence[];
  };
}

interface RankingHistoryItem {
  id: string;
  sport: string;
  score: number;
  nationalRank?: number;
  stateRank?: number;
  districtRank?: number;
  isProvisional: boolean;
  modelVersion: string;
  createdAt: string;
}

interface AthleteProfile {
  id: string;
  athleteId: string;
  fullName: string;
  sport: string;
  state: string;
  district: string;
  ageCategory: string;
  gender: string;
  bio?: string;
  position?: string;
  experienceYears?: number;
  avatarUrl?: string;
  achievements: string[];
  isVerified: boolean;
  isProvisional: boolean;
  verifiedMatchesCount: number;
  verifiedPerformanceScore: number;
  nationalRank?: number;
  stateRank?: number;
  districtRank?: number;
  createdAt: string;
  stats: {
    totalMatches: number;
    wins: number;
    winRate: number;
    avgScore: number;
  };
  matchParticipations: MatchParticipation[];
  rankingHistory: RankingHistoryItem[];
}

export default function AthletePublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const athleteIdentifier = params?.id as string;

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches" | "progression" | "achievements">("matches");

  useEffect(() => {
    if (athleteIdentifier) {
      fetchAthlete();
    }
  }, [athleteIdentifier]);

  const fetchAthlete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/auth/athletes/${encodeURIComponent(athleteIdentifier)}`);
      if (res.data?.success && res.data.athlete) {
        setAthlete(res.data.athlete);
      } else {
        setError(res.data?.message || "Athlete profile not found.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load athlete profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (athlete?.athleteId) {
      navigator.clipboard.writeText(athlete.athleteId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${athlete?.fullName} | SportRise Athlete Profile`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading verified athlete profile...</p>
        </div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Athlete Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error || "The athlete profile does not exist or has been removed."}</p>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Tiranga Ambient Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-transparent to-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-1 shadow-xl shadow-orange-500/20">
              {athlete.avatarUrl ? (
                <img
                  src={athlete.avatarUrl}
                  alt={athlete.fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-orange-400">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            {athlete.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1.5 shadow-lg" title="Officially Verified Athlete">
                <ShieldCheck className="w-4 h-4 font-black" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {athlete.fullName}
              </h1>

              {athlete.isProvisional ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" /> Provisional Ranking
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Official Verified Rank
                </span>
              )}
            </div>

            {/* Athlete ID Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-orange-400 px-3 py-1 rounded-lg">
                {athlete.athleteId}
              </span>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                title="Copy Athlete ID"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            {/* Bio */}
            {athlete.bio && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                {athlete.bio}
              </p>
            )}

            {/* Location & Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {athlete.district}, {athlete.state}
              </span>
              <span>&bull;</span>
              <span className="text-orange-400 font-bold">{athlete.sport}</span>
              <span>&bull;</span>
              <span>{athlete.ageCategory} &bull; {athlete.gender}</span>
              {athlete.position && (
                <>
                  <span>&bull;</span>
                  <span className="text-slate-300 font-medium">Position: {athlete.position}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Verified Score
            </span>
            <span className="text-2xl font-black text-orange-400">
              {athlete.verifiedPerformanceScore ? athlete.verifiedPerformanceScore.toFixed(1) : "0.0"}
            </span>
            <span className="text-[10px] text-slate-500 block">Scale 0 - 100</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              National Rank
            </span>
            <span className="text-2xl font-black text-amber-300">
              {athlete.nationalRank ? `#${athlete.nationalRank}` : "—"}
            </span>
            <span className="text-[10px] text-slate-500 block">All-India</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              State Rank
            </span>
            <span className="text-2xl font-black text-white">
              {athlete.stateRank ? `#${athlete.stateRank}` : "—"}
            </span>
            <span className="text-[10px] text-slate-500 block">{athlete.state}</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              District Rank
            </span>
            <span className="text-2xl font-black text-slate-200">
              {athlete.districtRank ? `#${athlete.districtRank}` : "—"}
            </span>
            <span className="text-[10px] text-slate-500 block">{athlete.district}</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Verified Matches
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {athlete.stats?.totalMatches || athlete.verifiedMatchesCount || 0}
            </span>
            <span className="text-[10px] text-slate-500 block">Official Fixtures</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Win Rate
            </span>
            <span className="text-2xl font-black text-sky-400">
              {athlete.stats?.winRate || 0}%
            </span>
            <span className="text-[10px] text-slate-500 block">{athlete.stats?.wins || 0} Won</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "matches"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Verified Matches ({athlete.matchParticipations?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("progression")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "progression"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Rating History ({athlete.rankingHistory?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "achievements"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Medal className="w-4 h-4" />
          <span>Achievements ({athlete.achievements?.length || 0})</span>
        </button>
      </div>

      {/* TAB CONTENT: Matches */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {(!athlete.matchParticipations || athlete.matchParticipations.length === 0) ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Verified Matches Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Official tournament scorecards submitted by affiliated institutions will be listed here after referee verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {athlete.matchParticipations.map((part) => {
                const match = part.match;
                const isWinner =
                  match.winner &&
                  part.teamName &&
                  match.winner.toLowerCase().includes(part.teamName.toLowerCase());

                let statsObj: Record<string, any> = {};
                try {
                  statsObj = JSON.parse(part.individualStats || "{}");
                } catch {
                  statsObj = {};
                }

                return (
                  <div
                    key={part.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            {match.matchNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {match.sport}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {match.competitionName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {match.venue} &bull; {new Date(match.matchDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-white block">
                            Score: {match.finalScore}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              isWinner
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {isWinner ? "Match Won" : "Match Lost"}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-2xl border border-orange-500/20 text-center min-w-[70px]">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                          <span className="text-base font-black text-orange-400">
                            {part.performanceRating ? part.performanceRating.toFixed(1) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Evidence Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      {/* Individual Stats Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        {part.teamName && (
                          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                            Team: <strong className="text-white">{part.teamName}</strong>
                          </span>
                        )}
                        {part.role && (
                          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                            Role: <strong className="text-white">{part.role}</strong>
                          </span>
                        )}
                        {Object.entries(statsObj).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300"
                          >
                            <span className="capitalize">{k}</span>:{" "}
                            <strong className="text-orange-400">{String(v)}</strong>
                          </span>
                        ))}
                      </div>

                      {/* Evidence Link */}
                      {match.evidences && match.evidences.length > 0 && (
                        <div className="flex items-center gap-2">
                          {match.evidences.map((ev) => (
                            <a
                              key={ev.id}
                              href={ev.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Verified Scorecard</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Rating Progression */}
      {activeTab === "progression" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Rating History & Movement</h3>
              <p className="text-xs text-slate-400">
                Audited historical recalculations triggered exclusively by verified tournament scorecards.
              </p>
            </div>
            <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              v2.0-verified-hybrid
            </span>
          </div>

          {(!athlete.rankingHistory || athlete.rankingHistory.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No historical movement recorded yet. Rating updates will appear after each sanctioned match.
            </p>
          ) : (
            <div className="space-y-3">
              {athlete.rankingHistory.map((h, i) => (
                <div
                  key={h.id || i}
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        Rating: {h.score.toFixed(1)} / 100
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(h.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        &bull; {h.isProvisional ? "Provisional Phase" : "Confirmed Tier"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-300 block">
                      {h.nationalRank ? `Rank #${h.nationalRank}` : "Provisional"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {h.modelVersion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Achievements */}
      {activeTab === "achievements" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Verified Honors & Badges</h3>
          {(!athlete.achievements || athlete.achievements.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No official achievements recorded on profile yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {athlete.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800"
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <Medal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ach}</h4>
                    <span className="text-[10px] text-slate-400">Verified SportRise Athlete Record</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
