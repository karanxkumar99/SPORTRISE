"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInstitution } from "../../../../lib/institution-context";
import api from "../../../../lib/api";
import { getMediaUrl } from "../../../../lib/utils";
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
  Sparkles,
  Award,
  AlertTriangle,
  UserCheck,
  FileCheck,
  ExternalLink,
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
  "Kabaddi",
  "Kho-Kho",
];

const AGE_CATEGORIES = ["U-14", "U-17", "U-19", "Senior", "Open"];
const PLACEMENTS = [
  "1st Place / Gold",
  "2nd Place / Silver",
  "3rd Place / Bronze",
  "Finalist",
  "Semi-Finalist",
  "Quarter-Finalist",
  "Participant",
];

interface ParticipantInput {
  athleteId: string;
  teamName: string;
  role: string;
  position?: number | string;
  placement?: string;
  disqualified?: boolean;
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

  // Managed Events for Authorization
  const [managedEvents, setManagedEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Form State
  const [sport, setSport] = useState("Athletics");
  const [category, setCategory] = useState("U-19");
  const [competitionName, setCompetitionName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [venue, setVenue] = useState(institution ? `${institution.name} Sports Ground` : "");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchFormat, setMatchFormat] = useState("Standard Tournament Match");
  const [rulesSummary, setRulesSummary] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [winner, setWinner] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  // Referee & Disqualification
  const [refereeName, setRefereeName] = useState("");
  const [refereeLicense, setRefereeLicense] = useState("");
  const [refereeRemarks, setRefereeRemarks] = useState("");
  const [disqualificationInfo, setDisqualificationInfo] = useState("");

  // Participants
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    {
      athleteId: "",
      teamName: institution ? institution.name : "Host Team",
      role: "Starter",
      position: 1,
      placement: "1st Place / Gold",
      disqualified: false,
      outcome: "WON",
      stats: {},
    },
  ]);

  // Evidence files
  const [evidences, setEvidences] = useState<EvidenceInput[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Scorecard OCR state
  const [analyzingOcr, setAnalyzingOcr] = useState(false);
  const [ocrReport, setOcrReport] = useState<any | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load institution managed events
  useEffect(() => {
    if (institution) {
      api
        .get("/events/public", { params: { tab: "All" } })
        .then((res) => {
          if (res.data?.success) {
            const allEvts = res.data.events || [];
            const myEvts = allEvts.filter(
              (e: any) =>
                e.institutionId === institution.id ||
                e.hostingInstitution?.toLowerCase() === institution.name.toLowerCase() ||
                e.organizer?.toLowerCase() === institution.name.toLowerCase()
            );
            setManagedEvents(myEvts.length > 0 ? myEvts : allEvts.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, [institution]);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    if (!eventId) return;

    const evt = managedEvents.find((e) => e.id === eventId);
    if (evt) {
      setCompetitionName(evt.name);
      if (evt.sportGame) setSport(evt.sportGame);
      if (evt.venueName) setVenue(`${evt.venueName}, ${evt.city || ""}`);
      if (evt.startDate) setMatchDate(new Date(evt.startDate).toISOString().split("T")[0]);
      if (evt.category) setCategory(evt.category.includes("U-") ? evt.category : "U-19");
    }
  };

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        athleteId: "",
        teamName: institution ? institution.name : "",
        role: "Player",
        position: prev.length + 1,
        placement: "Participant",
        disqualified: false,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, categoryType: string) => {
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
        const newEv: EvidenceInput = {
          fileUrl: res.data.file.url,
          fileName: res.data.file.originalName,
          fileType: res.data.file.mimeType,
          fileSize: res.data.file.size,
          category: categoryType,
        };
        setEvidences((prev) => [...prev, newEv]);

        // Auto-run OCR preview if scorecard uploaded
        if (categoryType === "scorecard") {
          runOcrAnalysis(newEv.fileUrl, newEv.fileType);
        }
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

  const runOcrAnalysis = async (fileUrl: string, mimeType: string) => {
    setAnalyzingOcr(true);
    try {
      const res = await api.post("/matches/analyze-scorecard", {
        fileUrl,
        mimeType,
        sport,
        competitionName,
        finalScore,
        winner,
        venue,
        matchDate,
      });
      if (res.data?.success && res.data.result) {
        setOcrReport(res.data.result);
      }
    } catch (err: any) {
      console.warn("OCR preview warning:", err.message);
    } finally {
      setAnalyzingOcr(false);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    setError(null);

    if (!competitionName || !venue || !matchDate || !finalScore) {
      setError("Please complete all required match details (Competition Name, Venue, Date, Final Score).");
      return;
    }

    setSubmitting(true);
    try {
      const refereeObj = {
        name: refereeName.trim(),
        license: refereeLicense.trim(),
        remarks: refereeRemarks.trim(),
      };

      const payload = {
        sport,
        competitionName,
        eventId: selectedEventId || null,
        category,
        refereeDetails: JSON.stringify(refereeObj),
        disqualificationInfo: disqualificationInfo.trim() || null,
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
          position: p.position ? Number(p.position) : null,
          placement: p.placement?.trim() || null,
          disqualified: Boolean(p.disqualified),
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
            &larr; Back to Match Submissions
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Submit Match Results & Scorecard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Authorized tournament results undergo anti-fraud hashing & referee verification before updating official rankings.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Authorized Portal
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 0: Authorized Event Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 1. Select Managed Event (Authorization Verification)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Select an event organized or managed by your institution to pre-fill verified competition details.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Custom Competition / Free Entry --</option>
                {managedEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.sportGame || evt.category}) &bull; {evt.venueName || evt.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1: Match & Competition Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> 2. Match Details & Discipline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sport / Discipline <span className="text-orange-500">*</span>
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
                  Age Category <span className="text-orange-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {AGE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Competition Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow Inter-College Badminton Championship"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opponent Institution / Team
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kendriya Vidyalaya Aliganj"
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
                  placeholder="e.g. K.D. Singh Babu Stadium, Lucknow"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Format & Round Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best of 3 Sets (21 Points) / Quarter-Final Stage"
                  value={matchFormat}
                  onChange={(e) => setMatchFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Final Scores & Match Outcome */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 3. Final Scores & Match Outcomes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Final Score <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21-18, 21-15 or 3 - 1"
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Winner (Team / Athlete)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DPS Lucknow / Arjun Singh"
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Outcome Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Won in straight sets (2-0)"
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Referee & Officials Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> 4. Referee & Officiating Official Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chief Referee / Umpire Name
                </label>
                <input
                  type="text"
                  placeholder="Official Referee Name"
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official License / Federation ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAI-REF-8921 or SAI Official ID"
                  value={refereeLicense}
                  onChange={(e) => setRefereeLicense(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Disqualification Notes (if any)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty if none"
                  value={disqualificationInfo}
                  onChange={(e) => setDisqualificationInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Participating Athletes & Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 5. Participating Athletes, Positions & Placements
              </h2>
              <button
                type="button"
                onClick={addParticipant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Athlete
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter official SportRise Athlete IDs (e.g. <code>SR-A-2026-XXXX</code>) to link verified performance ratings directly into multi-match national rankings.
            </p>

            <div className="space-y-4">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative group space-y-3"
                >
                  <div className="flex items-center justify-between">
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

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Athlete ID <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="SR-A-2026-..."
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
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Finishing Position</label>
                      <input
                        type="number"
                        placeholder="1, 2, 3..."
                        value={p.position || ""}
                        onChange={(e) => updateParticipant(idx, "position", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Placement / Medal</label>
                      <select
                        value={p.placement || "Participant"}
                        onChange={(e) => updateParticipant(idx, "placement", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      >
                        {PLACEMENTS.map((pl) => (
                          <option key={pl} value={pl}>
                            {pl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Match Outcome</label>
                      <select
                        value={p.outcome}
                        onChange={(e) => updateParticipant(idx, "outcome", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-bold"
                      >
                        <option value="WON">WON</option>
                        <option value="LOST">LOST</option>
                        <option value="DRAW">DRAW</option>
                      </select>
                    </div>
                  </div>

                  {/* Sport Specific Metric Inputs */}
                  <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sport.toLowerCase().includes("badminton") ? (
                      <>
                        <input
                          type="number"
                          placeholder="Sets Won"
                          onChange={(e) => updateParticipant(idx, "stats.setsWon", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Sets Lost"
                          onChange={(e) => updateParticipant(idx, "stats.setsLost", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Points Scored"
                          onChange={(e) => updateParticipant(idx, "stats.pointsScored", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Points Conceded"
                          onChange={(e) => updateParticipant(idx, "stats.pointsConceded", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    ) : sport.toLowerCase().includes("cricket") ? (
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
                          placeholder="Runs conceded"
                          onChange={(e) => updateParticipant(idx, "stats.runsConceded", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          placeholder="Points / Goals"
                          onChange={(e) => updateParticipant(idx, "stats.points", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Timing (e.g. 10.82s)"
                          onChange={(e) => updateParticipant(idx, "stats.timing", e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Official Evidence Upload & AI Scorecard Reading */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> 6. Official Evidence & AI Scorecard Processing
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Attach official match sheets (PDF/Images), scoreboard photos, or match video clips. SHA-256 integrity hash is computed for anti-fraud auditing.
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
                <span className="text-xs font-bold text-white block">Official Scorecard (PDF / Image)</span>
                <span className="text-[10px] text-slate-500">Signed tournament sheet</span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "scorecard")}
                  disabled={uploadingFile}
                />
              </label>

              <label className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl cursor-pointer text-center block transition-all">
                <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">Scoreboard Photograph</span>
                <span className="text-[10px] text-slate-500">Digital / physical board photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "scoreboard")}
                  disabled={uploadingFile}
                />
              </label>

              <label className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl cursor-pointer text-center block transition-all">
                <Video className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">Match Video Clip</span>
                <span className="text-[10px] text-slate-500">Highlights or final rally</span>
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
                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading file & computing SHA-256 hash...
              </div>
            )}

            {/* Uploaded Evidence List */}
            {evidences.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">
                  Attached Evidence Files ({evidences.length}):
                </span>
                {evidences.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {ev.category === "scorecard" && (
                        <button
                          type="button"
                          onClick={() => runOcrAnalysis(ev.fileUrl, ev.fileType)}
                          disabled={analyzingOcr}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{analyzingOcr ? "Analyzing..." : "Run AI OCR"}</span>
                        </button>
                      )}

                      <a
                        href={getMediaUrl(ev.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white"
                        title="Preview File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => removeEvidence(idx)}
                        className="p-1.5 text-red-400 hover:text-red-300"
                        title="Remove File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI OCR Analysis Report Box */}
            {ocrReport && (
              <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      AI Scorecard Analysis Report
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      ocrReport.status === "EXTRACTED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : ocrReport.status === "DUPLICATE_FLAGGED"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {ocrReport.status === "EXTRACTED"
                      ? "High Confidence OCR"
                      : ocrReport.status === "DUPLICATE_FLAGGED"
                      ? "Fraud / Duplicate Flagged"
                      : ocrReport.status === "AI_SERVICE_NOT_CONFIGURED"
                      ? "AI Unconfigured (Manual Review)"
                      : "Human Review Required"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ocrReport.message}
                </p>

                {ocrReport.sha256Hash && (
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded-lg border border-slate-800 truncate">
                    SHA-256 Integrity: {ocrReport.sha256Hash}
                  </div>
                )}

                {ocrReport.detectedInconsistencies?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 block">
                      Detected Inconsistencies:
                    </span>
                    <ul className="space-y-1">
                      {ocrReport.detectedInconsistencies.map((inc: string, i: number) => (
                        <li key={i} className="text-xs text-amber-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-500 italic">
                  Note: AI analysis is an officiating audit tool. All submitted matches remain in verification status until formally confirmed by tournament commissioners.
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              <strong className="text-slate-300">Status Workflow:</strong> Draft &rarr; Submitted &rarr; Under Verification &rarr; Verified &rarr; Official Rankings
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
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
        </div>
      </main>
    </div>
  );
}
