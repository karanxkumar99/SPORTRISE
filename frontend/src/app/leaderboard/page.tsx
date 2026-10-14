"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface RankedAthlete {
  id: string;
  athleteId: string;
  fullName: string;
  sport: string;
  position?: string;
  avatarUrl?: string;
  state: string;
  district: string;
  ageCategory: string;
  gender: string;
  skillIndex: number;
  verifiedPerformanceScore?: number;
  isProvisional?: boolean;
  verifiedMatchesCount?: number;
  nationalRank?: number;
  stateRank?: number;
  districtRank?: number;
  contextualRank: number;
  badge: "Gold" | "Silver" | "Bronze" | "Top10" | "Standard" | "Provisional";
}

function LeaderboardInner() {
  const searchParams = useSearchParams();

  // Filters
  const [selectedSport, setSelectedSport] = useState<string>("Athletics");
  const [selectedState, setSelectedState] = useState<string>("All India");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedAge, setSelectedAge] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [provisionalFilter, setProvisionalFilter] = useState<string>("all"); // all, confirmed_only, provisional_only

  const [athletes, setAthletes] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<{
    totalAthletes: number;
    confirmedRankedAthletes: number;
    averageScore: number;
    topScore: number;
  }>({
    totalAthletes: 0,
    confirmedRankedAthletes: 0,
    averageScore: 50,
    topScore: 50,
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

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSport, selectedState, selectedDistrict, selectedAge, selectedGender, provisionalFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        sport: selectedSport,
      };

      if (selectedState !== "All India") params.state = selectedState;
      if (selectedDistrict !== "All") params.district = selectedDistrict;
      if (selectedAge !== "All") params.ageCategory = selectedAge;
      if (selectedGender !== "All") params.gender = selectedGender;
      if (provisionalFilter !== "all") params.provisional = provisionalFilter;

      const res = await api.get("/ranking/leaderboard", { params });
      if (res.data?.success) {
        setAthletes(res.data.data);
        setSummary(res.data.summary);
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
      {/* Page Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Khelo India Aligned • Official Grassroots Standings</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          National & State Sports Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-2">
          Rankings are calculated deterministically on a 0–100 scale using authenticated match scorecards. Athletes with under 2 verified matches maintain Provisional status.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-10 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Sport Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Sport Category
            </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="All">All Sports</option>
              {OLYMPIC_SPORTS.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              State / UT
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("All");
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="All India">All India (National)</option>
              {ALL_INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === "All India"}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold disabled:opacity-40"
            >
              <option value="All">All Districts</option>
              {districtsForState.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Age Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Age Bracket
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="All">All Ages</option>
              <option value="U-14">Under 14 (U-14)</option>
              <option value="U-17">Under 17 (U-17)</option>
              <option value="U-19">Under 19 (U-19)</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          {/* Provisional vs Confirmed Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Calibration Status
            </label>
            <select
              value={provisionalFilter}
              onChange={(e) => setProvisionalFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="all">All Athletes</option>
              <option value="confirmed_only">Officially Confirmed Only</option>
              <option value="provisional_only">Provisional Status Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Podium Highlights */}
      {!loading && top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
          {/* Silver #2 */}
          {top2 && (
            <Link
              href={`/athletes/${top2.athleteId || top2.id}`}
              className="order-2 md:order-1 bg-slate-900 border-2 border-slate-700/50 rounded-3xl p-5 text-center shadow-xl hover:border-slate-500 hover:scale-[1.02] transition-all block group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
                2
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Silver Podium
              </div>
              <h3 className="text-lg font-black text-white mt-1 truncate group-hover:text-orange-400 transition-colors">{top2.fullName}</h3>
              <p className="text-[11px] font-mono text-orange-400 mt-0.5">{top2.athleteId}</p>
              <p className="text-xs text-slate-400 mt-1">{top2.district}, {top2.state}</p>
              <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xl font-black text-slate-200">
                  {top2.verifiedPerformanceScore?.toFixed(1) || top2.skillIndex}
                </span>
                <span className="text-[10px] text-slate-500 block">Verified Score (0-100)</span>
              </div>
            </Link>
          )}

          {/* Gold #1 */}
          <Link
            href={`/athletes/${top1.athleteId || top1.id}`}
            className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl relative md:-translate-y-2 hover:border-amber-400 hover:scale-[1.02] transition-all block group"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
              1
            </div>
            <div className="text-xs text-amber-400 font-black uppercase tracking-wider flex items-center justify-center gap-1">
              <CrownIcon className="w-4 h-4" />
              National Champion
            </div>
            <h3 className="text-xl font-black text-white mt-1 truncate group-hover:text-amber-300 transition-colors">{top1.fullName}</h3>
            <p className="text-xs font-mono text-orange-400 font-bold mt-0.5">{top1.athleteId}</p>
            <p className="text-xs text-slate-300 mt-1">{top1.district}, {top1.state}</p>
            <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-amber-400/30">
              <span className="text-2xl font-black text-amber-300">
                {top1.verifiedPerformanceScore?.toFixed(1) || top1.skillIndex}
              </span>
              <span className="text-[10px] text-slate-400 block">Verified Match Score (0 - 100)</span>
            </div>
          </Link>

          {/* Bronze #3 */}
          {top3 && (
            <Link
              href={`/athletes/${top3.athleteId || top3.id}`}
              className="order-3 md:order-3 bg-slate-900 border-2 border-amber-700/30 rounded-3xl p-5 text-center shadow-xl hover:border-amber-600 hover:scale-[1.02] transition-all block group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow">
                3
              </div>
              <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                Bronze Podium
              </div>
              <h3 className="text-lg font-black text-white mt-1 truncate group-hover:text-amber-500 transition-colors">{top3.fullName}</h3>
              <p className="text-[11px] font-mono text-orange-400 mt-0.5">{top3.athleteId}</p>
              <p className="text-xs text-slate-400 mt-1">{top3.district}, {top3.state}</p>
              <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xl font-black text-amber-500">
                  {top3.verifiedPerformanceScore?.toFixed(1) || top3.skillIndex}
                </span>
                <span className="text-[10px] text-slate-500 block">Verified Score (0-100)</span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-orange-400" />
            Rankings Standings Table
          </h2>
          <span className="text-xs text-slate-400">
            {summary.confirmedRankedAthletes} Confirmed &bull; {summary.totalAthletes} Total Athletes
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Calculating verified sports leaderboard...</p>
          </div>
        ) : athletes.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">
              No athletes found matching current filter criteria.
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
                  <th className="py-4 px-6">Calibration</th>
                  <th className="py-4 px-6 text-right">Verified Score (0-100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {athletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-4 px-6 font-bold">
                      <span className="font-mono text-slate-300">#{athlete.contextualRank}</span>
                    </td>

                    <td className="py-4 px-6">
                      <Link
                        href={`/athletes/${athlete.athleteId || athlete.id}`}
                        className="group block"
                      >
                        <div className="font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                          <span>{athlete.fullName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                        </div>
                        <div className="text-[11px] font-mono text-orange-400">{athlete.athleteId}</div>
                      </Link>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-200 font-medium">{athlete.district}</div>
                      <div className="text-[11px] text-slate-400">{athlete.state}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="bg-slate-950 px-2 py-1 rounded text-xs border border-slate-800 text-slate-300">
                        {athlete.ageCategory} &bull; {athlete.gender}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {athlete.isProvisional ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Provisional
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="text-base font-black text-orange-400 font-mono">
                        {athlete.verifiedPerformanceScore?.toFixed(1) || (athlete.skillIndex / 10).toFixed(1)}
                      </span>
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

function CrownIcon(props: any) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
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
