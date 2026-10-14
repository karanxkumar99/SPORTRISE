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
  Calendar,
  MapPin,
  School,
  Copy,
  ChevronRight,
  ArrowRight,
  Check,
  Zap,
  User,
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
  const [applications, setApplications] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<"applications" | "matches" | "ai">("applications");

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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

        // Fetch applications for this athlete
        try {
          const appRes = await api.get(`/applications/my-applications`, {
            params: { email: res.data.user.email, userId: res.data.user.id },
          });
          if (appRes.data?.success) {
            setApplications(appRes.data.applications || []);
          }
        } catch (e) {
          console.warn("Could not load applications:", e);
        }

        // Fetch upcoming events
        try {
          const evtRes = await api.get(`/events/public`, {
            params: { tab: "Upcoming" },
          });
          if (evtRes.data?.success) {
            setUpcomingEvents(evtRes.data.events?.slice(0, 3) || []);
          }
        } catch (e) {
          console.warn("Could not load upcoming events:", e);
        }
      }
    } catch (err) {
      console.warn("Failed to load full athlete profile:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleCopyAthleteId = () => {
    if (currentUser?.athleteId) {
      navigator.clipboard.writeText(currentUser.athleteId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
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

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File size exceeds 5MB limit. Please select a smaller photo.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setAvatarError("Unsupported image format. Allowed formats: JPG, PNG, WEBP, GIF.");
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data.file?.url) {
        setEditAvatarUrl(res.data.file.url);
      } else {
        setAvatarError(res.data?.message || "Avatar upload failed.");
      }
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || err.message || "Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner: Athlete Identity & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur relative overflow-hidden">
        {/* Subtle Tricolour Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-70" />

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {currentUser.fullName}
            </h1>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-bold border border-orange-500/30">
              {currentUser.sport}
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-semibold border border-slate-700">
              Age: {currentUser.ageCategory || "U-19"} &bull; {currentUser.gender || "All"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {/* Athlete ID with Copy Button */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Athlete ID:</span>
              <code className="text-orange-400 font-bold font-mono">{currentUser.athleteId}</code>
              <button
                onClick={handleCopyAthleteId}
                className="ml-1 text-slate-400 hover:text-white transition-colors"
                title="Copy Athlete ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span>&bull;</span>
            <span>{currentUser.district}, {currentUser.state}</span>
            <span>&bull;</span>
            <span className="text-slate-300">{currentUser.institutionName || `${currentUser.district} Sports Club`}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/events"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            <span>Browse Events</span>
          </Link>

          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Edit3 className="w-4 h-4 text-orange-400" />
            <span>Edit Profile</span>
          </button>

          <Link
            href="/events/my-applications"
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>My Applications ({applications.length})</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Column (Passport & Ranks) | Right Column (Applied Events, Matches, AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Digital Athlete Passport Card & Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-400" />
                Digital Athlete Passport
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official Standard 🇮🇳
              </span>
            </div>
            <AthleteCard athlete={currentUser} />
          </div>

          {/* Quick Ranks Summary */}
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

          {/* Profile Details Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs space-y-3">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
              Personalized Athlete Details
            </h3>

            <div className="flex justify-between">
              <span className="text-slate-400">Primary Sport:</span>
              <strong className="text-orange-400">{currentUser.sport}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Age Category:</span>
              <strong className="text-white">{currentUser.ageCategory || "U-19"}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Gender Category:</span>
              <strong className="text-white">{currentUser.gender || "Male"}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Institution / Club:</span>
              <strong className="text-white truncate max-w-[170px]">
                {currentUser.institutionName || "Grassroots Sports Club"}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">State & District:</span>
              <strong className="text-white">{currentUser.district}, {currentUser.state}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Verified Matches:</span>
              <strong className="text-emerald-400">{currentUser.verifiedMatchesCount || 0} Sanctioned</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Navigation & Information Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "applications"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Applied Events ({applications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("matches")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "matches"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Verified Matches ({verifiedMatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "ai"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Skill Analysis</span>
            </button>
          </div>

          {/* TAB 1: Applied Events & Applications */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-400" />
                      Applied Tournaments & Application Status
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time status tracking for events you have registered for with your Athlete ID
                    </p>
                  </div>
                  <Link
                    href="/events"
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <span>Browse More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 p-6">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No Event Applications Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                      You haven&apos;t registered for any tournaments yet. Explore live competitions in your state and submit your application with a single click.
                    </p>
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      Explore Sporting Events Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                              #{app.applicationNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                app.status === "Approved"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : app.status === "Rejected"
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              Status: {app.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white">
                            {app.event?.name || "Event Registration"}
                          </h4>

                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{app.event?.hostingInstitution}</span>
                            <span>&bull;</span>
                            <span>{app.event?.venueName}, {app.event?.city}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/events/${app.eventId || app.event?.id}`}
                            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <span>Event Details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Upcoming Events */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Recommended Upcoming Events for You
                  </h3>
                  <Link
                    href="/events"
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingEvents.map((evt) => (
                    <Link
                      key={evt.id}
                      href={`/events/${evt.id}`}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 hover:border-emerald-500/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="text-emerald-400 font-bold">{evt.sportGame}</span>
                        <span>{evt.city}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {evt.name.replace(" [DEMO EVENT]", "")}
                      </h4>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{evt.isPaid ? `Fee: ₹${evt.registrationFee}` : "Free Registration"}</span>
                        <span className="text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform">
                          Apply &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Verified Match History */}
          {activeTab === "matches" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    Verified Match History & Statistics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official sanctioned match scorecards entered by verified educational institutions
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  {verifiedMatches.length} Matches
                </span>
              </div>

              {verifiedMatches.length === 0 ? (
                <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 p-6">
                  <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No Verified Matches Linked Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                    Provide your unique Athlete ID (<code>{currentUser.athleteId}</code>) to tournament organizers so your scorecards link directly to your official national profile.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
                  >
                    Browse Tournaments &rarr;
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
          )}

          {/* TAB 3: AI Diagnostic Insights */}
          {activeTab === "ai" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      AI Verified Match Assessment
                    </h3>
                    <p className="text-xs text-slate-400">
                      Objective evaluation calibrated strictly on official match performance
                    </p>
                  </div>
                </div>
              </div>

              {aiReport ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 italic">
                    &ldquo;{aiReport.summary}&rdquo;
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                        Strengths
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
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">
                    AI diagnostic reports generate automatically as verified sanctioned matches are recorded by match officials.
                  </p>
                </div>
              )}
            </div>
          )}
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
                  placeholder="e.g. 100m Sprinter / Striker / Badminton Singles"
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
                <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-orange-500/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {editAvatarUrl ? (
                      <img
                        src={editAvatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      JPG, PNG, WEBP, or GIF (Max 5MB)
                    </p>
                    {uploadingAvatar && (
                      <p className="text-[11px] text-orange-400 font-bold animate-pulse">
                        Uploading & framing image...
                      </p>
                    )}
                    {avatarError && (
                      <p className="text-[11px] text-red-400 font-semibold">{avatarError}</p>
                    )}
                  </div>
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
