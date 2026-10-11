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
  BarChart3,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Target,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryRecord {
  id: string;
  sport: string;
  skillIndex: number;
  metrics: Record<string, any>;
  aiStrengths: string[];
  aiImprovements: string[];
  aiRecommendations: string[];
  recordedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, refreshProfile } = useAuth();

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<{
    totalNationalInSport: number;
    totalStateInSport: number;
    totalDistrictInSport: number;
  }>({
    totalNationalInSport: 1,
    totalStateInSport: 1,
    totalDistrictInSport: 1,
  });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadProfileAndHistory();
    }
  }, [user, isLoading, router]);

  const loadProfileAndHistory = async () => {
    setFetching(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/ai/history"),
      ]);

      if (profileRes.data?.stats) {
        setStats(profileRes.data.stats);
      }
      if (historyRes.data?.records) {
        setHistory(historyRes.data.records);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard extras:", err);
    } finally {
      setFetching(false);
    }
  };

  if (isLoading || (fetching && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading Athlete Passport...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Prepare chart data
  const chartData =
    history.length > 0
      ? history.map((rec, idx) => ({
          name: new Date(rec.recordedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          skillIndex: rec.skillIndex,
          index: idx + 1,
        }))
      : [
          { name: "Initial", skillIndex: user.skillIndex || 500, index: 1 },
          { name: "Current", skillIndex: user.skillIndex || 500, index: 2 },
        ];

  const latestRecord = history[history.length - 1];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Athlete Dashboard
            </h1>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-bold border border-orange-500/30">
              {user.sport}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered Grassroots Athlete Profile &bull; {user.district}, {user.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/performance-log"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            Log New Performance
          </Link>
          <Link
            href="/leaderboard"
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Check Standings
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
                Digital Athlete Passport
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official IOC Standard
              </span>
            </div>
            <AthleteCard athlete={user} />
          </div>

          {/* Rank Hierarchy Quick Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* National Rank */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                National Rank
              </span>
              <span className="text-2xl font-black text-amber-300 block mt-1">
                #{user.nationalRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                of {stats.totalNationalInSport} in {user.sport}
              </span>
            </div>

            {/* State Rank */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                State Rank
              </span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">
                #{user.stateRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                in {user.state}
              </span>
            </div>

            {/* District Rank */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                District Rank
              </span>
              <span className="text-2xl font-black text-sky-400 block mt-1">
                #{user.districtRank ?? 1}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                in {user.district}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Graph & AI Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Graph Over Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Performance Progression Over Time
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic 0 - 1000 AI Skill Index trajectory
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                  Current: <strong className="text-orange-400">{user.skillIndex}</strong>
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSkill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[200, 1000]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fb923c" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="skillIndex"
                    name="Skill Index"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSkill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Assessment & Feedback Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    SAI-Aligned AI Performance Analysis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Objective diagnostic feedback & Khelo India target recommendations
                  </p>
                </div>
              </div>
              <Link
                href="/performance-log"
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                New Assessment &rarr;
              </Link>
            </div>

            {latestRecord ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Strengths */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                    Key Strengths
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {latestRecord.aiStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                    Areas of Improvement
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {latestRecord.aiImprovements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Drills */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/20">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-2">
                    Targeted Training Drills
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {latestRecord.aiRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <BarChart3 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  No drills logged yet for this athlete profile.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Log your sprint times, lifts, or match scores to unlock personalized AI feedback!
                </p>
                <Link
                  href="/performance-log"
                  className="mt-4 inline-block px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Log First Drill
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
