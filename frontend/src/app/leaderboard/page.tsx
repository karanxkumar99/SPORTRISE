"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "../../lib/api";
import { OLYMPIC_SPORTS } from "../../data/olympic-sports";
import { ALL_INDIAN_STATES, INDIAN_STATES_AND_UT } from "../../data/india-locations";
import {
  Trophy,
  Award,
  Medal,
  Filter,
  MapPin,
  Flame,
  Search,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface RankedAthlete {
  id: string;
  athleteId: string;
  fullName: string;
  sport: string;
  state: string;
  district: string;
  ageCategory: string;
  gender: string;
  skillIndex: number;
  nationalRank?: number;
  stateRank?: number;
  districtRank?: number;
  contextualRank: number;
  badge: "Gold" | "Silver" | "Bronze" | "Top10" | "Standard";
}

function LeaderboardInner() {
  const searchParams = useSearchParams();

  // Filters
  const [selectedSport, setSelectedSport] = useState<string>("Athletics");
  const [selectedState, setSelectedState] = useState<string>("All India");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedAge, setSelectedAge] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");

  const [athletes, setAthletes] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<{
    totalAthletes: number;
    averageSkillIndex: number;
    topSkillIndex: number;
  }>({
    totalAthletes: 0,
    averageSkillIndex: 500,
    topSkillIndex: 500,
  });

  useEffect(() => {
    const qSport = searchParams.get("sport");
    if (qSport) {
      setSelectedSport(qSport);
    }
  }, [searchParams]);

  // Available districts for chosen state
  const districtsForState = useMemo(() => {
    if (selectedState === "All India" || !INDIAN_STATES_AND_UT[selectedState]) {
      return [];
    }
    return INDIAN_STATES_AND_UT[selectedState];
  }, [selectedState]);

  const cacheRef = useRef<Record<string, { athletes: RankedAthlete[]; summary: any }>>({});

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSport, selectedState, selectedDistrict, selectedAge, selectedGender]);

  const fetchLeaderboard = async () => {
    const cacheKey = `${selectedSport}_${selectedState}_${selectedDistrict}_${selectedAge}_${selectedGender}`;
    if (cacheRef.current[cacheKey]) {
      setAthletes(cacheRef.current[cacheKey].athletes);
      setSummary(cacheRef.current[cacheKey].summary);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, string> = {
        sport: selectedSport,
      };

      if (selectedState !== "All India") params.state = selectedState;
      if (selectedDistrict !== "All") params.district = selectedDistrict;
      if (selectedAge !== "All") params.ageCategory = selectedAge;
      if (selectedGender !== "All") params.gender = selectedGender;

      const res = await api.get("/ranking/leaderboard", { params });

      if (res.data?.success) {
        const data = res.data.data;
        const sum = res.data.summary || summary;
        setAthletes(data);
        if (res.data.summary) {
          setSummary(sum);
        }
        cacheRef.current[cacheKey] = { athletes: data, summary: sum };
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const top1 = athletes[0];
  const top2 = athletes[1];
  const top3 = athletes[2];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          National & State Sports Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Real-time, sport-wise rankings powered by the 1000-point SPORTRISE AI Skill Index &bull; Filterable by All-India, 36 States/UTs, Districts, and Age Categories.
        </p>
      </div>

      {/* Sport Selector Carousel / Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6 backdrop-blur">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {OLYMPIC_SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.name)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedSport === sport.name
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
              }`}
            >
              <span>{sport.name}</span>
              <span className="text-[10px] opacity-75 font-mono">{sport.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8 backdrop-blur">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State / UT Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              State / Union Territory
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("All");
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
            >
              <option value="All India">🇮🇳 All India (National Rank)</option>
              {ALL_INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter (Cascading) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === "All India"}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">All Districts</option>
              {districtsForState.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Age Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Age Category
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="U-14">Under-14 (Sub-Junior)</option>
              <option value="U-17">Under-17 (Youth)</option>
              <option value="U-19">Under-19 (Junior)</option>
              <option value="Senior">Senior (Open)</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Aggregate Stats Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Athletes in View: <strong className="text-white">{athletes.length}</strong>
            </span>
            <span>
              Top Score: <strong className="text-orange-400">{summary.topSkillIndex}</strong>
            </span>
            <span>
              Sport Average: <strong className="text-emerald-400">{summary.averageSkillIndex}</strong>
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-mono">
            {selectedState} &bull; {selectedSport}
          </span>
        </div>
      </div>

      {/* Top 3 Podium Display (Olympic Style) */}
      {!loading && athletes.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end max-w-4xl mx-auto">
          {/* Silver #2 */}
          <div className="order-2 md:order-1 bg-slate-900 border-2 border-slate-400/30 rounded-3xl p-5 text-center shadow-xl relative hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
              2
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Silver Podium
            </div>
            <h3 className="text-lg font-black text-white mt-1 truncate">
              {top2.fullName}
            </h3>
            <p className="text-[11px] font-mono text-orange-400 mt-0.5">
              {top2.athleteId}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {top2.district}, {top2.state}
            </p>
            <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-black text-slate-200">{top2.skillIndex}</span>
              <span className="text-[10px] text-slate-500 block">AI Skill Index</span>
            </div>
          </div>

          {/* Gold #1 (Center, Elevated) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 text-center shadow-2xl relative -translate-y-2 hover:border-amber-400 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/20">
              1
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-amber-300 font-bold uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-1">
              <Award className="w-3.5 h-3.5" /> Gold Champion
            </div>
            <h3 className="text-xl font-black text-white mt-1 truncate">
              {top1.fullName}
            </h3>
            <p className="text-xs font-mono text-orange-400 mt-0.5">
              {top1.athleteId}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {top1.district}, {top1.state}
            </p>
            <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-amber-400/30">
              <span className="text-2xl font-black text-amber-300">{top1.skillIndex}</span>
              <span className="text-[10px] text-slate-400 block">AI Skill Index (0 - 1000)</span>
            </div>
          </div>

          {/* Bronze #3 */}
          <div className="order-3 md:order-3 bg-slate-900 border-2 border-amber-700/30 rounded-3xl p-5 text-center shadow-xl relative hover:border-amber-600 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
              3
            </div>
            <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
              Bronze Podium
            </div>
            <h3 className="text-lg font-black text-white mt-1 truncate">
              {top3.fullName}
            </h3>
            <p className="text-[11px] font-mono text-orange-400 mt-0.5">
              {top3.athleteId}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {top3.district}, {top3.state}
            </p>
            <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-black text-amber-500">{top3.skillIndex}</span>
              <span className="text-[10px] text-slate-500 block">AI Skill Index</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Standings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-orange-400" />
            Rankings Standings Table
          </h2>
          <span className="text-xs text-slate-400">
            Ordered by Normalized AI Skill Score
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Calculating dynamic sports leaderboard...</p>
          </div>
        ) : athletes.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">
              No athletes found matching current filter criteria.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting the State, District, or Age Category filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Athlete Name & ID</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">Skill Index (0-1000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {athletes.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6 font-bold">
                      <div className="flex items-center gap-2">
                        {athlete.contextualRank === 1 ? (
                          <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-xs shadow-sm">
                            🥇 1
                          </span>
                        ) : athlete.contextualRank === 2 ? (
                          <span className="w-7 h-7 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-black text-xs">
                            🥈 2
                          </span>
                        ) : athlete.contextualRank === 3 ? (
                          <span className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-black text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 flex items-center justify-center font-mono text-xs">
                            #{athlete.contextualRank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Athlete Name & ID */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                        {athlete.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-orange-400">
                        {athlete.athleteId}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6">
                      <div className="text-slate-200 font-medium">
                        {athlete.district}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {athlete.state}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="bg-slate-950 px-2 py-1 rounded text-xs border border-slate-800 text-slate-300">
                        {athlete.ageCategory} &bull; {athlete.gender}
                      </span>
                    </td>

                    {/* Skill Index */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-block text-right">
                        <span className="text-base font-black text-orange-400 font-mono">
                          {athlete.skillIndex}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1 ml-auto border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                            style={{ width: `${(athlete.skillIndex / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading leaderboard...
        </div>
      }
    >
      <LeaderboardInner />
    </Suspense>
  );
}
