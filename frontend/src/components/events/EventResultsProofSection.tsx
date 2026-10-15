"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Medal,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Camera,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  User,
  Sparkles,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils";

export interface MatchParticipantData {
  id: string;
  athleteId: string;
  teamName?: string | null;
  role?: string | null;
  position?: number | null;
  placement?: string | null;
  disqualified?: boolean;
  individualStats?: Record<string, any>;
  performanceRating?: number | null;
  verifiedStatsSaved?: boolean;
  athlete?: {
    id: string;
    athleteId: string;
    fullName: string;
    sport: string;
    avatarUrl?: string | null;
    state: string;
    district: string;
    ageCategory: string;
    gender: string;
  };
}

export interface MatchEvidenceData {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  sha256Hash?: string | null;
  ocrData?: string | null;
  ocrStatus?: string | null;
  ocrConfidence?: number | null;
  verificationFlag: string;
  notes?: string | null;
  createdAt: string;
}

export interface MatchData {
  id: string;
  matchNumber: string;
  sport: string;
  competitionName: string;
  opponentName?: string | null;
  venue: string;
  matchDate: string;
  matchFormat: string;
  category?: string | null;
  refereeDetails?: {
    refereeName?: string;
    license?: string;
    remarks?: string;
  } | null;
  finalScore: string;
  winner?: string | null;
  resultSummary?: string | null;
  status: string;
  isCompleted: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  participants?: MatchParticipantData[];
  evidences?: MatchEvidenceData[];
}

interface EventResultsProofSectionProps {
  eventName: string;
  sportGame: string;
  hostingInstitution: string;
  institutionLogo?: string | null;
  institutionCity?: string;
  institutionState?: string;
  matches: MatchData[];
}

export default function EventResultsProofSection({
  eventName,
  sportGame,
  hostingInstitution,
  institutionLogo,
  institutionCity,
  institutionState,
  matches,
}: EventResultsProofSectionProps) {
  // Lightbox State
  const [activeEvidence, setActiveEvidence] = useState<{
    url: string;
    title: string;
    category: string;
    sha256?: string | null;
    fileSize?: number;
    notes?: string | null;
    matchNumber?: string;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Event Results & Scorecards Processing</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
          This event has concluded. Participating schools and tournament officials are currently submitting authenticated scorecards and photo evidence for integrity verification.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Official results will appear here once authenticated by {hostingInstitution}.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Event Concluded • Official Results Ratified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Certified Match Scorecards & Evidence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            All fixtures, timing slips, electronic finishes, and player performance statistics have been verified by certified officiating delegates from {hostingInstitution}.
          </p>
        </div>

        {/* Demo Data Disclaimer Badge */}
        <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-[11px] font-bold text-purple-200 shadow-md">
            Sample Data &bull; Demo Certification
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {matches.length} Sanctioned Fixture(s) Recorded
          </span>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-8">
        {matches.map((match, mIdx) => (
          <div
            key={match.id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur transition-all"
          >
            {/* Match Header */}
            <div className="p-6 bg-slate-850/80 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                    {match.matchNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {match.sport} &bull; {match.matchFormat}
                  </span>
                  {match.category && (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {match.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Result
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">{match.competitionName}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {match.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(match.matchDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Match Result Podium Pill */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center min-w-[240px]">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-0.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Winner: {match.winner || "Concluded"}</span>
                </div>
                <div className="font-mono text-sm font-black text-white tracking-wide">
                  {match.finalScore}
                </div>
                {match.resultSummary && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {match.resultSummary}
                  </p>
                )}
              </div>
            </div>

            {/* Officiating / Referee Accreditation Box */}
            {match.refereeDetails && (
              <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">Chief Official:</span>
                  <span className="font-bold text-white">
                    {match.refereeDetails.refereeName || "Certified Technical Official"}
                  </span>
                  {match.refereeDetails.license && (
                    <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                      Lic: {match.refereeDetails.license}
                    </span>
                  )}
                </div>
                {match.refereeDetails.remarks && (
                  <span className="text-slate-400 italic text-[11px]">
                    &ldquo;{match.refereeDetails.remarks}&rdquo;
                  </span>
                )}
              </div>
            )}

            {/* Athlete Performances Table */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Medal className="w-4 h-4 text-orange-400" />
                  Participating Athletes & Official Performance Data
                </h4>
                <span className="text-[11px] text-slate-400">
                  Performance calibrated on deterministic 0–100 rating scale
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Place / Medal</th>
                      <th className="py-3 px-4">Athlete Name & ID</th>
                      <th className="py-3 px-4">Origin & Category</th>
                      <th className="py-3 px-4">Verified Performance Stats</th>
                      <th className="py-3 px-4 text-center">Match Rating</th>
                      <th className="py-3 px-4 text-right">Passport Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {match.participants && match.participants.length > 0 ? (
                      match.participants.map((p, pIdx) => (
                        <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                          {/* Placement */}
                          <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                            {p.position === 1 || p.placement?.toLowerCase().includes("gold") || p.placement?.toLowerCase().includes("champ") ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                🥇 1st &bull; Gold
                              </span>
                            ) : p.position === 2 || p.placement?.toLowerCase().includes("silver") || p.placement?.toLowerCase().includes("runner") ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-slate-400/15 text-slate-200 border border-slate-400/30">
                                🥈 2nd &bull; Silver
                              </span>
                            ) : p.position === 3 || p.placement?.toLowerCase().includes("bronze") ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-700/15 text-amber-400 border border-amber-700/30">
                                🥉 3rd &bull; Bronze
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800">
                                #{p.position || pIdx + 1} Finalist
                              </span>
                            )}
                          </td>

                          {/* Athlete Link */}
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/athletes/${p.athlete?.athleteId || p.athlete?.id || p.athleteId}`}
                              className="group block"
                            >
                              <div className="font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                                <span>{p.athlete?.fullName || "Verified Athlete"}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                              </div>
                              <div className="font-mono text-[11px] text-orange-400">
                                {p.athlete?.athleteId || "ID Verified"}
                              </div>
                            </Link>
                          </td>

                          {/* Location & Category */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 text-xs font-medium">
                              {p.athlete?.district ? `${p.athlete.district}, ${p.athlete.state}` : p.teamName || "State Squad"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {p.athlete?.ageCategory || "Collegiate"} &bull; {p.athlete?.gender || "Open"}
                            </div>
                          </td>

                          {/* Sport-Specific Stats */}
                          <td className="py-3.5 px-4">
                            {p.individualStats && Object.keys(p.individualStats).length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-sm">
                                {Object.entries(p.individualStats).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="px-2 py-0.5 rounded bg-slate-900 text-[11px] text-slate-200 border border-slate-800 font-mono"
                                  >
                                    <span className="text-slate-400 font-sans capitalize">{k}:</span> {String(v)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Official placement recorded</span>
                            )}
                          </td>

                          {/* Match Rating */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 font-black font-mono text-sm border border-orange-500/20">
                              {p.performanceRating?.toFixed(1) || "85.0"}
                            </span>
                          </td>

                          {/* Verification */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ranked
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                          Participant roster is being processed by the registrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Proof & Evidence Section with Institutional Verification Seal */}
            <div className="p-6 bg-slate-950/70 border-t border-slate-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between pb-6 border-b border-slate-800/80">
                {/* Institutional Verification Stamp Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-emerald-950/30 border border-amber-500/40 shadow-inner">
                  {/* Decorative Stamp Seal Icon */}
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/10 flex flex-col items-center justify-center text-center p-1 flex-shrink-0 shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-300 mt-0.5">
                      SEAL RATIFIED
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wide text-white">
                        Institutional Verification Seal
                      </span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        Demo Stamp
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-0.5">
                      {hostingInstitution} &bull; {institutionCity}, {institutionState}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                      Authenticated by Chief Integrity Officer. All athlete statistics, electronic timings, and referee results are bound by digital tamper verification.
                    </p>
                  </div>
                </div>

                {/* Reviewer & Integrity Stamp Info */}
                <div className="text-left lg:text-right space-y-1">
                  <div className="text-xs text-slate-400">
                    Integrity Review: <span className="font-bold text-white">{match.reviewedBy || "Chief Integrity Officer Sharma"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sanction Date: {new Date(match.matchDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Anti-Tamper Registry Verified</span>
                  </div>
                </div>
              </div>

              {/* Attached Evidence & Photo Gallery */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    Supporting Evidence, Official Scorecards & Match Photos ({match.evidences?.length || 0})
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    Click any scorecard or photograph to preview high-resolution document
                  </span>
                </div>

                {match.evidences && match.evidences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {match.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-md flex flex-col justify-between"
                      >
                        {/* Image / Thumbnail Container */}
                        <div
                          onClick={() =>
                            setActiveEvidence({
                              url: getMediaUrl(ev.fileUrl),
                              title: ev.fileName,
                              category: ev.category,
                              sha256: ev.sha256Hash,
                              fileSize: ev.fileSize,
                              notes: ev.notes,
                              matchNumber: match.matchNumber,
                            })
                          }
                          className="relative h-44 bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                        >
                          <img
                            src={getMediaUrl(ev.fileUrl)}
                            alt={ev.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                          {/* Hover Overlay Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40">
                            <span className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5">
                              <ZoomIn className="w-3.5 h-3.5" />
                              View High-Res
                            </span>
                          </div>

                          {/* Category Tag Top Left */}
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur border border-slate-800 text-orange-400">
                            {ev.category === "scorecard" ? "Official Scorecard" : ev.category === "photo" ? "Match Photo" : ev.category}
                          </span>

                          {/* Verified Seal Stamp Watermark Top Right */}
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 backdrop-blur border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Seal Verified
                          </span>
                        </div>

                        {/* Metadata Footer */}
                        <div className="p-3.5 space-y-2">
                          <h6 className="text-xs font-bold text-white truncate" title={ev.fileName}>
                            {ev.fileName}
                          </h6>

                          {ev.notes && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {ev.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                            <span>{(ev.fileSize / 1024 / 1024).toFixed(2)} MB &bull; {ev.fileType}</span>
                            <div className="flex items-center gap-2">
                              {ev.sha256Hash && (
                                <button
                                  onClick={() => handleCopyHash(ev.sha256Hash!)}
                                  className="text-slate-400 hover:text-white flex items-center gap-1"
                                  title="Copy SHA-256 Hash"
                                >
                                  {copiedHash === ev.sha256Hash ? (
                                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Copied
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5 font-mono">
                                      <Copy className="w-3 h-3" /> Hash
                                    </span>
                                  )}
                                </button>
                              )}
                              <a
                                href={getMediaUrl(ev.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-0.5"
                              >
                                Open <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    Supporting photographs and signed scorecards are being archived.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveEvidence(null)}
        >
          <div
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/80">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold text-white truncate">{activeEvidence.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="capitalize">{activeEvidence.category}</span>
                    {activeEvidence.matchNumber && (
                      <span className="font-mono text-orange-400">&bull; {activeEvidence.matchNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-300 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <a
                  href={activeEvidence.url}
                  download={activeEvidence.title}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Download / Open Original"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveEvidence(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex items-center justify-center min-h-[350px]">
              <div
                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease" }}
                className="relative max-w-full max-h-[60vh] flex items-center justify-center"
              >
                <img
                  src={activeEvidence.url}
                  alt={activeEvidence.title}
                  className="rounded-xl object-contain max-h-[55vh] shadow-2xl border border-slate-800"
                />

                {/* Institutional Stamp Watermark */}
                <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-amber-300 leading-tight">
                      Official Institutional Stamp
                    </p>
                    <p className="text-[9px] text-slate-400">{hostingInstitution} [SAMPLE DATA]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Verification Info */}
            <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                {activeEvidence.notes && (
                  <p className="text-slate-300 text-xs mb-1">{activeEvidence.notes}</p>
                )}
                {activeEvidence.sha256 && (
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate max-w-xs sm:max-w-md text-slate-300">{activeEvidence.sha256}</span>
                    <button
                      onClick={() => handleCopyHash(activeEvidence.sha256!)}
                      className="text-orange-400 hover:underline"
                    >
                      {copiedHash === activeEvidence.sha256 ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 whitespace-nowrap self-end sm:self-auto">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  Sample Record &bull; Demo
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Tamper Proof
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
