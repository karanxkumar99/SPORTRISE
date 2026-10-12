"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react";

const OLYMPIC_SPORTS_FILTER = [
  "All",
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
];

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [selectedSport, statusFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedSport !== "All") params.sport = selectedSport;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/matches", { params });
      if (res.data?.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) =>
    searchQuery
      ? m.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.matchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.venue.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Evidence-Based Sports Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Sanctioned Matches & Scorecards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            Explore verified school and college tournament results authenticated with official scorecards, referee signatures, and photographic evidence.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tournament, match #, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              {["All", "VERIFIED", "SUBMITTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {st === "All" ? "All Results" : st === "VERIFIED" ? "Verified Only" : "In Review"}
                </button>
              ))}
            </div>
          </div>

          {/* Sport Pills */}
          <div className="mt-4 pt-4 border-t border-slate-850 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 pl-1">
              <Filter className="w-3 h-3" /> Sport:
            </span>
            {OLYMPIC_SPORTS_FILTER.map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSport(sp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSport === sp
                    ? "bg-slate-800 text-orange-400 font-bold border border-orange-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Match Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading sanctioned match fixtures...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Match Fixtures Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              No matches match your current filter. Verified results will appear here as participating schools and colleges submit scorecards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                      {m.matchNumber}
                    </span>
                    {m.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Verified Result
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        <Clock className="w-3 h-3" /> Evidence In Review
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    {m.sport} • {m.matchFormat}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1 mb-2">
                    {m.competitionName}
                  </h3>

                  {/* Score Box */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{m.institution?.name}</span>
                      <span className="font-mono font-black text-white text-sm">{m.finalScore}</span>
                    </div>
                    {m.winner && (
                      <div className="mt-1 pt-1 border-t border-slate-900 text-[11px] text-emerald-400">
                        Winner: <strong>{m.winner}</strong>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span className="truncate">{m.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{new Date(m.matchDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {m._count?.participants || 0} Athlete(s) • {m._count?.evidences || 0} Evidence(s)
                  </span>
                  <Link
                    href={`/matches/${m.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Full Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
