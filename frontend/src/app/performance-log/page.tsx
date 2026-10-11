"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import api from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { OLYMPIC_SPORTS, OlympicSportDetail } from "../../data/olympic-sports";
import {
  Sparkles,
  Award,
  BarChart3,
  Flame,
  CheckCircle2,
  AlertCircle,
  Target,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface AssessmentOutput {
  skillIndex: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  benchmarkComparison: {
    nationalStandard: number;
    kheloIndiaTarget: number;
    athletePercentile: number;
  };
  athleteRanks?: {
    nationalRank: number;
    stateRank: number;
    districtRank: number;
    skillIndex: number;
  };
}

function PerformanceLogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [selectedSportName, setSelectedSportName] = useState<string>("Athletics");
  const [metricValues, setMetricValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentOutput | null>(null);

  // Load sport from query or athlete's registered sport
  useEffect(() => {
    const qSport = searchParams.get("sport");
    if (qSport) {
      setSelectedSportName(qSport);
    } else if (user?.sport) {
      setSelectedSportName(user.sport);
    }
  }, [searchParams, user]);

  const currentSportDetail: OlympicSportDetail =
    OLYMPIC_SPORTS.find((s) => s.name.toLowerCase() === selectedSportName.toLowerCase()) ||
    OLYMPIC_SPORTS[0];

  // Set default placeholder metric values when sport changes
  useEffect(() => {
    const initial: Record<string, string | number> = {};
    if (currentSportDetail?.metricFields) {
      currentSportDetail.metricFields.forEach((f) => {
        if (f.placeholder.startsWith("e.g. ")) {
          initial[f.id] = f.placeholder.replace("e.g. ", "");
        }
      });
    }
    setMetricValues(initial);
    setAssessmentResult(null);
  }, [currentSportDetail]);

  const handleMetricChange = (fieldId: string, val: string) => {
    setMetricValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (user) {
        // Authenticated assessment: saves record & recalculates ranks
        const res = await api.post("/ai/assess", {
          sport: currentSportDetail.name,
          metrics: metricValues,
        });

        if (res.data?.success && res.data.assessment) {
          setAssessmentResult(res.data.assessment);
          await refreshProfile();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f97316", "#ffffff", "#16a34a"],
          });
        } else {
          setError(res.data?.message || "Failed to analyze performance.");
        }
      } else {
        // Guest / Preview calculation
        const res = await api.post("/ai/preview", {
          sport: currentSportDetail.name,
          metrics: metricValues,
          ageCategory: "U-19",
          gender: "Male",
        });

        if (res.data?.success && res.data.assessment) {
          setAssessmentResult(res.data.assessment);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } else {
          setError(res.data?.message || "Preview evaluation failed.");
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          AI Performance Assessment Engine
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Ingest objective biometric & competition metrics &bull; Calibrate your 0-1000 Skill Index against Khelo India standards &bull; Receive actionable tactical drills.
        </p>
      </div>

      {/* Sport Selector & Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur mb-10">
        {/* Sport Discipline Picker */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
            Target Olympic Discipline
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {OLYMPIC_SPORTS.map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelectedSportName(sport.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSportName.toLowerCase() === sport.name.toLowerCase()
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* User Context Banner */}
        {user ? (
          <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider block">
                Active Athlete Profile
              </span>
              <strong className="text-sm text-white">{user.fullName}</strong>{" "}
              <span className="text-xs text-slate-400 font-mono">({user.athleteId})</span>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.ageCategory} &bull; {user.district}, {user.state}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Current Skill Index</span>
              <span className="text-xl font-black text-orange-400 font-mono">
                {user.skillIndex}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span>
              ℹ️ You are in <strong>Guest Evaluation Mode</strong>. Scores will be computed but not permanently saved to your Athlete ID.
            </span>
            <button
              onClick={() => router.push("/login")}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-lg transition-colors ml-3 flex-shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Sport Metric Fields Form */}
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Official Drill Metrics for {currentSportDetail.name}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter official timed trials, weights, or tournament match records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentSportDetail.metricFields.map((field) => (
                <div key={field.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {field.label}{" "}
                    <span className="text-[10px] text-orange-400 font-normal">
                      ({field.unit})
                    </span>
                  </label>
                  <input
                    type="number"
                    step={field.step || 1}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    value={metricValues[field.id] ?? ""}
                    onChange={(e) => handleMetricChange(field.id, e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">{field.helperText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit AI Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing AI Biomechanical & Benchmark Evaluation...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                {user ? "Calculate & Update Athlete Ranking" : "Run AI Skill Analysis (Preview)"}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* AI Assessment Result Display Card */}
      {assessmentResult && (
        <div className="bg-slate-900/95 border-2 border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-8 animate-fade-in">
          {/* Top Result Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assessment Complete & Normalized
              </div>
              <h2 className="text-2xl font-black text-white">
                AI Performance Diagnostic Report
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calibrated across Khelo India Youth Games, National & Olympic benchmarks
              </p>
            </div>

            {/* Big Skill Index Score Badge */}
            <div className="bg-slate-950 p-4 rounded-2xl border-2 border-orange-500/40 text-center min-w-[160px] shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Calculated Skill Index
              </span>
              <span className="text-4xl font-black text-orange-400 font-mono block my-0.5">
                {assessmentResult.skillIndex}
              </span>
              <span className="text-[10px] text-slate-500">out of 1000 Scale</span>
            </div>
          </div>

          {/* National / State / District Ranking Update Ribbon (if authenticated) */}
          {assessmentResult.athleteRanks && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  New National Rank
                </span>
                <span className="text-xl font-black text-amber-300">
                  #{assessmentResult.athleteRanks.nationalRank}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  New State Rank
                </span>
                <span className="text-xl font-black text-emerald-400">
                  #{assessmentResult.athleteRanks.stateRank}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  New District Rank
                </span>
                <span className="text-xl font-black text-sky-400">
                  #{assessmentResult.athleteRanks.districtRank}
                </span>
              </div>
            </div>
          )}

          {/* Benchmark Comparative Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>National Talent Standard Comparison</span>
              <span className="text-orange-400">
                Top {100 - assessmentResult.benchmarkComparison.athletePercentile}% Percentile in India
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(assessmentResult.skillIndex / 1000) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>District Level (~500)</span>
              <span className="text-emerald-400">
                Khelo India Target: {assessmentResult.benchmarkComparison.kheloIndiaTarget}
              </span>
              <span className="text-amber-400">
                Senior National: {assessmentResult.benchmarkComparison.nationalStandard}
              </span>
              <span className="text-sky-400">Olympic Standard (950+)</span>
            </div>
          </div>

          {/* Three Feedback Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Biomechanical Strengths
              </span>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {assessmentResult.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas of Improvement */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Identified Bottlenecks
              </span>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {assessmentResult.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations & Drills */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-sky-500/30">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-sky-400" />
                Targeted Training Drills
              </span>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {assessmentResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => router.push("/leaderboard")}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              See how this places you on the National Leaderboard &rarr;
            </button>
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                View Updated Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                Register to Save ID & Ranks
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PerformanceLogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading AI Performance Engine...
        </div>
      }
    >
      <PerformanceLogInner />
    </Suspense>
  );
}
