"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";
import AthleteCard from "../../components/AthleteCard";
import {
  Trophy,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  X,
  Save,
  Sparkles,
  TrendingUp,
  Target,
  Flame,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, refreshProfile } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalNationalInSport: 1,
    totalStateInSport: 1,
    totalDistrictInSport: 1,
  });
  const [verifiedMatches, setVerifiedMatches] = useState<any[]>([]);
  const [rankingHistory, setRankingHistory] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editExperience, setEditExperience] = useState(0);
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editAchievements, setEditAchievements] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadProfileData();
    }
  }, [user, isLoading, router]);

  const loadProfileData = async () => {
    setFetching(true);
    try {
      const res = await api.get("/auth/profile");
      if (res.data?.success) {
        setProfileData(res.data.user);
        setStats(res.data.stats || {});
        setVerifiedMatches(res.data.verifiedMatches || []);
        setRankingHistory(res.data.rankingHistory || []);

        // Seed edit form
        setEditFullName(res.data.user.fullName || "");
        setEditBio(res.data.user.bio || "");
        setEditPosition(res.data.user.position || "");
        setEditExperience(res.data.user.experienceYears || 0);
        setEditAvatarUrl(res.data.user.avatarUrl || "");
        setEditAchievements(
          Array.isArray(res.data.user.achievements)
            ? res.data.user.achievements.join("\n")
            : ""
        );
      }
    } catch (err) {
      console.warn("Failed to load full athlete profile:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const achievementsList = editAchievements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.put("/auth/profile", {
        fullName: editFullName,
        bio: editBio,
        position: editPosition,
        experienceYears: editExperience,
        avatarUrl: editAvatarUrl,
        achievements: achievementsList,
      });

      if (res.data?.success) {
        setSaveSuccess(true);
        await refreshProfile();
        await loadProfileData();
        setTimeout(() => {
          setShowEditModal(false);
          setSaveSuccess(false);
        }, 1200);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data.file?.url) {
        setEditAvatarUrl(res.data.file.url);
      }
    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
    }
  };

  if (isLoading || (fetching && !profileData && !user)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading Verified Athlete Passport...</p>
        </div>
      </div>
    );
  }

  const currentUser = profileData || user;
  const aiReport = currentUser?.lastAiReport || null;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Athlete Passport & Ratings
            </h1>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-bold border border-orange-500/30">
              {currentUser.sport}
            </span>
            {currentUser.isProvisional ? (
              <span className="text-xs bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-bold border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Provisional Ranking (Needs 2+ Matches)
              </span>
            ) : (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Officially Calibrated & Ranked
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authenticated Grassroots Sports Identity &bull; {currentUser.district}, {currentUser.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-orange-400" />
            Edit Profile
          </button>
          <Link
            href="/matches"
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            Browse Matches
          </Link>
          <Link
            href="/leaderboard"
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            National Leaderboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Digital Athlete Passport Card */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-400" />
                Digital Athlete Identity
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official IOC Standard
              </span>
            </div>
            <AthleteCard athlete={currentUser} />
          </div>

          {/* Rank Hierarchy Quick Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                National Rank
              </span>
              <span className="text-2xl font-black text-amber-300 block mt-1">
                #{currentUser.nationalRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                of {stats.totalNationalInSport} in {currentUser.sport}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                State Rank
              </span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">
                #{currentUser.stateRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                in {currentUser.state}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                District Rank
              </span>
              <span className="text-2xl font-black text-sky-400 block mt-1">
                #{currentUser.districtRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                in {currentUser.district}
              </span>
            </div>
          </div>

          {/* Verified Score Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Official Verified Score
              </span>
              <span className="text-[10px] font-mono text-orange-400 font-bold">
                Model: v2.0-verified-hybrid
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">
                {currentUser.verifiedPerformanceScore?.toFixed(1) || "0.0"}
              </span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Computed deterministically from {currentUser.verifiedMatchesCount || 0} sanctioned match scorecards.
            </p>
          </div>
        </div>

        {/* Right Column: Verified Matches & AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Verified Match History */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  Verified Match History & Statistics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official sanctioned competition records entered by verified educational institutions
                </p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                {verifiedMatches.length} Recorded Match(es)
              </span>
            </div>

            {verifiedMatches.length === 0 ? (
              <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 p-6">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">No Verified Matches Linked Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                  Provide your unique Athlete ID (<code>{currentUser.athleteId}</code>) to tournament organizers so your match scorecards link directly to your official national profile.
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
                >
                  Discover Upcoming Tournaments &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Tournament</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Score & Outcome</th>
                      <th className="py-2.5 px-3">Stats</th>
                      <th className="py-2.5 px-3 text-center">Rating</th>
                      <th className="py-2.5 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {verifiedMatches.map((vm) => (
                      <tr key={vm.id} className="hover:bg-slate-850/40">
                        <td className="py-3 px-3">
                          <strong className="text-white block truncate max-w-[180px]">
                            {vm.competitionName}
                          </strong>
                          <span className="text-[10px] text-slate-400">{vm.institutionName}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(vm.matchDate).toLocaleDateString("en-IN", { dateStyle: "short" })}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-white font-bold block">{vm.finalScore}</span>
                          <span className="text-[10px] text-emerald-400">{vm.winner}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {Object.entries(vm.individualStats || {}).map(([k, v]: any) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                            {vm.performanceRating?.toFixed(1) || "50.0"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/matches/${vm.matchId}`}
                            className="text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 2: AI Verified Performance Assessment */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Verified Match AI Performance Analysis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Objective diagnostic evaluation calibrated strictly on official tournament data
                  </p>
                </div>
              </div>
              {aiReport?.confidence && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Confidence: {aiReport.confidence}
                </span>
              )}
            </div>

            {aiReport ? (
              <div className="space-y-4 mt-4">
                {/* Summary Quote */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 italic">
                  &ldquo;{aiReport.summary}&rdquo;
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strengths */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                      Verified Strengths
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {aiReport.strengths?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                      Areas for Improvement
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {aiReport.weaknesses?.map((imp: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Target className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/20">
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-2">
                      Targeted Drills & Recommendations
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {aiReport.recommendations?.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Peer Comparison */}
                {aiReport.peerComparison && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Benchmark Peer Comparison:</span>
                    <strong className="text-slate-200">{aiReport.peerComparison}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  AI performance report will generate automatically as verified matches are confirmed by officials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-400" />
                Edit Athlete Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Playing Position / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100m Sprinter / Striker / Fast Bowler"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={editExperience}
                  onChange={(e) => setEditExperience(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of your athletic aspirations and journey..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notable Achievements (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="State Silver Medalist 2025&#10;District Gold in 100m Sprint"
                  value={editAchievements}
                  onChange={(e) => setEditAchievements(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Profile Photo (Avatar)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
