"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SPORTS_CATALOGUE,
  SPORTS_CATEGORIES,
  SportCatalogueItem,
} from "../../data/sports-catalogue";
import {
  Search,
  Filter,
  ArrowRight,
  Award,
  Shield,
  Layers,
  MapPin,
  Users,
  Compass,
  CheckCircle2,
  CalendarPlus,
  BookOpen,
  Sparkles,
  Zap,
  Footprints,
  Waves,
  Swords,
  Target,
  Bike,
  Flag,
  Snowflake,
} from "lucide-react";

export default function SportsCataloguePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedClassification, setSelectedClassification] = useState<string>("All");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("All");
  const [selectedParticipation, setSelectedParticipation] = useState<string>("All");
  const [indiaPopularOnly, setIndiaPopularOnly] = useState<boolean>(false);

  // Category Icon mapper
  const getCategoryIcon = (code: string) => {
    switch (code) {
      case "A":
        return <Footprints className="w-5 h-5 text-orange-400" />;
      case "B":
        return <Waves className="w-5 h-5 text-sky-400" />;
      case "C":
        return <Users className="w-5 h-5 text-emerald-400" />;
      case "D":
        return <Zap className="w-5 h-5 text-amber-400" />;
      case "E":
        return <Swords className="w-5 h-5 text-red-400" />;
      case "F":
        return <Target className="w-5 h-5 text-purple-400" />;
      case "G":
        return <Bike className="w-5 h-5 text-yellow-400" />;
      case "H":
        return <Flag className="w-5 h-5 text-teal-400" />;
      case "I":
        return <Compass className="w-5 h-5 text-blue-400" />;
      case "J":
        return <Snowflake className="w-5 h-5 text-cyan-300" />;
      case "K":
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <Award className="w-5 h-5 text-orange-400" />;
    }
  };

  const filteredSports = useMemo(() => {
    return SPORTS_CATALOGUE.filter((sport) => {
      // Category filter
      if (selectedCategory !== "All" && sport.categoryCode !== selectedCategory) {
        return false;
      }
      // Classification filter
      if (
        selectedClassification !== "All" &&
        sport.olympicClassification !== selectedClassification
      ) {
        return false;
      }
      // Environment filter
      if (
        selectedEnvironment !== "All" &&
        sport.environment !== selectedEnvironment &&
        sport.environment !== "Indoor / Outdoor"
      ) {
        return false;
      }
      // Participation filter
      if (
        selectedParticipation !== "All" &&
        sport.participation !== selectedParticipation &&
        sport.participation !== "Both (Individual & Team)"
      ) {
        return false;
      }
      // India popular filter
      if (indiaPopularOnly && !sport.popularInIndia) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = sport.name.toLowerCase().includes(q);
        const matchesHindi = sport.hindiName.includes(q);
        const matchesCategory = sport.categoryName.toLowerCase().includes(q);
        const matchesDesc = sport.description.toLowerCase().includes(q);
        const matchesRegion = sport.regions.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesHindi && !matchesCategory && !matchesDesc && !matchesRegion) {
          return false;
        }
      }
      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedClassification,
    selectedEnvironment,
    selectedParticipation,
    indiaPopularOnly,
  ]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-orange-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[450px] bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Olympic & Tricolour Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-orange-500/10 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Official Sports Directory & Olympic Classifications 🇮🇳</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Indian & Olympic{" "}
            <span className="bg-gradient-to-r from-orange-400 via-white to-emerald-400 bg-clip-text text-transparent">
              Sports Catalogue
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Explore Olympic, Paralympic, Winter, and traditional Indian indigenous sports. Discover official event regulations, regional strongholds across Indian states, and tournament categories.
          </p>

          {/* Quick Category Summary Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <strong className="text-orange-400">{SPORTS_CATALOGUE.length}</strong> Disciplines
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <strong className="text-emerald-400">11</strong> Distinct Categories (A–K)
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <strong className="text-sky-400">Summer & Winter</strong> Olympic & Paralympic Coverage
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Row 1: Search & Toggles */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by sport, Hindi name, state (e.g. Haryana), or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* India Popular Quick Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold hover:border-orange-500/50 transition-colors w-full md:w-auto justify-between md:justify-start">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-400" />
                Popular in India Only
              </span>
              <input
                type="checkbox"
                checked={indiaPopularOnly}
                onChange={(e) => setIndiaPopularOnly(e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-slate-900 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Row 2: Category Selector Tabs */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              Sport Category (A to K)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
                }`}
              >
                All Categories ({SPORTS_CATALOGUE.length})
              </button>

              {SPORTS_CATEGORIES.map((cat) => {
                const count = SPORTS_CATALOGUE.filter((s) => s.categoryCode === cat.code).length;
                const isSelected = selectedCategory === cat.code;
                return (
                  <button
                    key={cat.code}
                    onClick={() => setSelectedCategory(cat.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                        : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
                    }`}
                  >
                    <span>{cat.code}. {cat.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Secondary Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
            {/* Olympic Classification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Olympic Classification
              </label>
              <select
                value={selectedClassification}
                onChange={(e) => setSelectedClassification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="All">All Classifications</option>
                <option value="Summer Olympic">Summer Olympic</option>
                <option value="Winter Olympic">Winter Olympic</option>
                <option value="Paralympic">Paralympic</option>
                <option value="Non-Olympic / National">Non-Olympic / National / Regional</option>
              </select>
            </div>

            {/* Environment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Venue Environment
              </label>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="All">All Environments</option>
                <option value="Indoor">Indoor Only</option>
                <option value="Outdoor">Outdoor Only</option>
                <option value="Indoor / Outdoor">Indoor or Outdoor</option>
              </select>
            </div>

            {/* Participation Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Participation Type
              </label>
              <select
                value={selectedParticipation}
                onChange={(e) => setSelectedParticipation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="All">All Participation Types</option>
                <option value="Individual">Individual</option>
                <option value="Team">Team</option>
                <option value="Both (Individual & Team)">Both (Individual & Team)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Results Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>
              Showing <strong className="text-white">{filteredSports.length}</strong> of {SPORTS_CATALOGUE.length} sports
            </span>
            {(selectedCategory !== "All" ||
              selectedClassification !== "All" ||
              selectedEnvironment !== "All" ||
              selectedParticipation !== "All" ||
              indiaPopularOnly ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedClassification("All");
                  setSelectedEnvironment("All");
                  setSelectedParticipation("All");
                  setIndiaPopularOnly(false);
                  setSearchQuery("");
                }}
                className="text-orange-400 hover:text-orange-300 font-bold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sport) => {
            return (
              <div
                key={sport.id}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-orange-500/50 rounded-3xl p-6 transition-all hover:-translate-y-1 group flex flex-col justify-between shadow-xl backdrop-blur relative overflow-hidden"
              >
                {/* Subtle Tricolour Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      Category {sport.categoryCode} &bull; {sport.categoryName}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sport.olympicClassification === "Summer Olympic"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : sport.olympicClassification === "Winter Olympic"
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          : sport.olympicClassification === "Paralympic"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {sport.olympicClassification}
                    </span>
                  </div>

                  {/* Sport Title & Hindi */}
                  <div className="flex items-start gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(sport.categoryCode)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                        {sport.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold">{sport.hindiName}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-3">
                    {sport.description}
                  </p>

                  {/* Environment & Participation Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      {sport.environment}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      {sport.participation}
                    </span>
                    {sport.popularInIndia && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                        🇮🇳 High Indian Popularity
                      </span>
                    )}
                  </div>

                  {/* Indian Regions & Hubs */}
                  {sport.regions && sport.regions.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Hubs in India: </span>
                      <span>{sport.regions.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {sport.rulebookSlug ? (
                    <Link
                      href={`/sports-corner/${sport.rulebookSlug}`}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      <span>Official Rules</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Standard Guidelines
                    </span>
                  )}

                  <Link
                    href={`/institution/events/create?sport=${encodeURIComponent(sport.name)}`}
                    className="text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-1 transition-colors"
                  >
                    <CalendarPlus className="w-3 h-3 text-orange-400" />
                    Host Event
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSports.length === 0 && (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No sports matched your search filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your search keywords, clear category selections, or reset your filters above.
            </p>
          </div>
        )}

        {/* Educational Note on Olympic Affiliation */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 leading-relaxed max-w-4xl mx-auto">
          <p className="font-semibold text-slate-300 mb-1">
            ℹ️ Sport Classification Note:
          </p>
          <p>
            SportRise documents sports recognized across the Summer Olympic Games, Winter Olympic Games, Paralympic Games, and Asian Games, alongside India&apos;s renowned indigenous and traditional competitions. Olympic program inclusion varies by host edition (e.g., Cricket and Squash join Los Angeles 2028). SportRise operates independently to empower grassroots athletes and does not imply official IOC commercial endorsement.
          </p>
        </div>
      </div>
    </div>
  );
}
