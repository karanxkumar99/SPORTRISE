"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInstitution } from "../../../../lib/institution-context";
import api from "../../../../lib/api";
import { InstitutionSidebar } from "../../../../components/institution/InstitutionSidebar";
import {
  Trophy,
  Calendar,
  MapPin,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const OLYMPIC_SPORTS_LIST = [
  "Athletics",
  "Cricket",
  "Football",
  "Basketball",
  "Badminton",
  "Table Tennis",
  "Boxing",
  "Wrestling",
  "Weightlifting",
  "Swimming",
  "Archery",
  "Shooting",
  "Volleyball",
  "Hockey",
  "Tennis",
  "Judo",
];

interface ParticipantInput {
  athleteId: string;
  teamName: string;
  role: string;
  outcome: "WON" | "LOST" | "DRAW";
  stats: Record<string, any>;
}

interface EvidenceInput {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  notes?: string;
}

export default function CreateMatchPage() {
  const router = useRouter();
  const { institution } = useInstitution();

  // Form State
  const [sport, setSport] = useState("Athletics");
  const [competitionName, setCompetitionName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [venue, setVenue] = useState(institution ? `${institution.name} Sports Ground` : "");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchFormat, setMatchFormat] = useState("Standard Tournament Match");
  const [rulesSummary, setRulesSummary] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [winner, setWinner] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  // Participants
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    {
      athleteId: "",
      teamName: institution ? institution.name : "Host Team",
      role: "Starter",
      outcome: "WON",
      stats: {},
    },
  ]);

  // Evidence files
  const [evidences, setEvidences] = useState<EvidenceInput[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        athleteId: "",
        teamName: institution ? institution.name : "",
        role: "Player",
        outcome: "WON",
        stats: {},
      },
    ]);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateParticipant = (index: number, field: string, value: any) => {
    setParticipants((prev) => {
      const updated = [...prev];
      if (field.startsWith("stats.")) {
        const statKey = field.split(".")[1];
        updated[index] = {
          ...updated[index],
          stats: { ...updated[index].stats, [statKey]: value },
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.file) {
        setEvidences((prev) => [
          ...prev,
          {
            fileUrl: res.data.file.url,
            fileName: res.data.file.originalName,
            fileType: res.data.file.mimeType,
            fileSize: res.data.file.size,
            category,
          },
        ]);
      } else {
        setUploadError(res.data?.message || "File upload failed.");
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || "Upload failed.");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const removeEvidence = (index: number) => {
    setEvidences((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    setError(null);

    if (!competitionName || !venue || !matchDate || !finalScore) {
      setError("Please complete all required match details (Competition Name, Venue, Date, Final Score).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sport,
        competitionName,
        opponentName,
        venue,
        matchDate,
        matchFormat,
        rulesSummary,
        finalScore,
        winner,
        resultSummary,
        participants: participants.map((p) => ({
          athleteId: p.athleteId.trim(),
          teamName: p.teamName.trim(),
          role: p.role.trim(),
          outcome: p.outcome,
          individualStats: p.stats,
        })),
        evidences,
        isDraft,
      };

      const res = await api.post("/matches", payload);

      if (res.data?.success) {
        router.push("/institution/matches");
      } else {
        setError(res.data?.message || "Failed to submit match.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit match.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/institution/matches"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold mb-2 inline-block"
          >
            &larr; Back to Matches
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Submit Match Scorecard & Evidence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official scorecards undergo anti-cheating verification before updating national athlete rankings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> 1. Match & Competition Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sport <span className="text-orange-500">*</span>
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {OLYMPIC_SPORTS_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Competition / Event Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Inter-School Athletics Meet 2026"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opponent Institution / Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern School Barakhamba"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Date <span className="text-orange-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Venue / Ground <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JLN Stadium, New Delhi"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Format / Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. T20 / 90 Minutes / 3 Sets of 21"
                  value={matchFormat}
                  onChange={(e) => setMatchFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Match Score & Outcome */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 2. Final Score & Result Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Final Score <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 - 1 or 184/5 vs 160/9"
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Winning Team / Athlete
                </label>
                <input
                  type="text"
                  placeholder="e.g. DPS R.K. Puram"
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Result Margin / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Won by 24 runs / Straight sets"
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Participating Athletes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 3. Participating Athletes & Statistics
              </h2>
              <button
                type="button"
                onClick={addParticipant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Athlete
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter the unique SportRise Athlete ID (e.g. <code>SR-IND-26-ATH-84920</code>) so verified stats are automatically linked to their national profile.
            </p>

            <div className="space-y-4">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400">Athlete #{idx + 1}</span>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(idx)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        SportRise Athlete ID
                      </label>
                      <input
                        type="text"
                        placeholder="SR-IND-..."
                        value={p.athleteId}
                        onChange={(e) => updateParticipant(idx, "athleteId", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Team</label>
                      <input
                        type="text"
                        value={p.teamName}
                        onChange={(e) => updateParticipant(idx, "teamName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role / Position</label>
                      <input
                        type="text"
                        placeholder="e.g. Striker / Batsman"
                        value={p.role}
                        onChange={(e) => updateParticipant(idx, "role", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Outcome</label>
                      <select
                        value={p.outcome}
                        onChange={(e) => updateParticipant(idx, "outcome", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      >
                        <option value="WON">WON</option>
                        <option value="LOST">LOST</option>
                        <option value="DRAW">DRAW</option>
                      </select>
                    </div>
                  </div>

                  {/* Sport Specific Metric Inputs */}
                  <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sport.toLowerCase().includes("cricket") ? (
                      <>
                        <input
                          type="number"
                          placeholder="Runs scored"
                          onChange={(e) => updateParticipant(idx, "stats.runs", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Balls faced"
                          onChange={(e) => updateParticipant(idx, "stats.balls", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Wickets taken"
                          onChange={(e) => updateParticipant(idx, "stats.wickets", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Overs bowled"
                          onChange={(e) => updateParticipant(idx, "stats.overs", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    ) : sport.toLowerCase().includes("football") ? (
                      <>
                        <input
                          type="number"
                          placeholder="Goals scored"
                          onChange={(e) => updateParticipant(idx, "stats.goals", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Assists"
                          onChange={(e) => updateParticipant(idx, "stats.assists", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Minutes played"
                          onChange={(e) => updateParticipant(idx, "stats.minutesPlayed", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Tackles"
                          onChange={(e) => updateParticipant(idx, "stats.tackles", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          placeholder="Points / Timing"
                          onChange={(e) => updateParticipant(idx, "stats.points", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Finishing Position (1, 2, 3)"
                          onChange={(e) => updateParticipant(idx, "stats.position", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Multi-File Supporting Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> 4. Official Evidence & Documentation Upload
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Attach official match sheets, referee signatures, scoreboard photos, or competition certificates. Uploads are securely audited.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {uploadError}
              </div>
            )}

            {/* Upload Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <label className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl cursor-pointer text-center block transition-all">
                <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">Official Match Sheet / PDF</span>
                <span className="text-[10px] text-slate-500">Signed scorecard</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "scorecard")}
                  disabled={uploadingFile}
                />
              </label>

              <label className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl cursor-pointer text-center block transition-all">
                <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">Scoreboard Photograph</span>
                <span className="text-[10px] text-slate-500">Venue or digital board</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "scoreboard")}
                  disabled={uploadingFile}
                />
              </label>

              <label className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl cursor-pointer text-center block transition-all">
                <Video className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">Match Video Clip</span>
                <span className="text-[10px] text-slate-500">MP4 highlights / finish</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "video")}
                  disabled={uploadingFile}
                />
              </label>
            </div>

            {uploadingFile && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center justify-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading evidence file to secure storage...
              </div>
            )}

            {/* Uploaded Evidence List */}
            {evidences.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Uploaded Evidence Files ({evidences.length}):
                </span>
                {evidences.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {ev.category}
                      </span>
                      <span className="text-white font-medium truncate">{ev.fileName}</span>
                      <span className="text-slate-500 text-[10px]">
                        ({(ev.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeEvidence(idx)}
                      className="text-red-400 hover:text-red-300 ml-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting || uploadingFile}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Submitting for Review...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Match for Official Verification
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
