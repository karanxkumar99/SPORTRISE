"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { OLYMPIC_SPORTS, SPORT_CATEGORIES } from "../../data/olympic-sports";
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Award,
  Shield,
  Layers,
} from "lucide-react";

export default function SportsCornerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSports = useMemo(() => {
    return OLYMPIC_SPORTS.filter((sport) => {
      const matchesCategory =
        selectedCategory === "All" || sport.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sport.name.toLowerCase().includes(q) ||
        sport.hindiName.includes(q) ||
        sport.code.toLowerCase().includes(q) ||
        sport.category.toLowerCase().includes(q) ||
        sport.overview.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Olympic Sports & Rules Corner
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Comprehensive directory of IOC Olympic sports with official rules, court & pitch dimensions, scoring systems, and Khelo India / Olympic qualification benchmarks.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl mb-10 backdrop-blur">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sport, code, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {SPORT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredSports.length} Olympic Disciplines</span>
          <span className="text-[11px] text-orange-400 font-mono">IOC / SAI Standards</span>
        </div>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSports.map((sport) => (
          <div
            key={sport.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 transition-all hover:-translate-y-1 group flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs bg-slate-950 text-slate-300 px-3 py-1 rounded-full font-semibold border border-slate-800">
                  {sport.category}
                </span>
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {sport.code}
                </span>
              </div>

              {/* Title & Hindi Title */}
              <h2 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors">
                {sport.name}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {sport.hindiName} &bull; {sport.governingBody}
              </p>

              {/* Overview */}
              <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                {sport.overview}
              </p>

              {/* Olympic History Highlight */}
              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 block mb-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Olympic Legacy:
                </span>
                <span className="line-clamp-2">{sport.olympicHistory}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-400 font-medium">
                Khelo India Benchmarks &rarr;
              </span>
              <Link
                href={`/sports-corner/${sport.slug}`}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow shadow-orange-500/20 flex items-center gap-1"
              >
                Rules & Details
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
