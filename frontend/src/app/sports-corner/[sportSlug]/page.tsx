"use client";

import React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { OLYMPIC_SPORTS } from "../../../data/olympic-sports";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Maximize2,
  Trophy,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Compass,
  Zap,
} from "lucide-react";

export default function SportDetailPage() {
  const params = useParams();
  const sportSlug = params?.sportSlug as string;

  const sport = OLYMPIC_SPORTS.find(
    (s) =>
      s.slug.toLowerCase() === sportSlug?.toLowerCase() ||
      s.id.toLowerCase() === sportSlug?.toLowerCase()
  );

  if (!sport) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white">Olympic Sport Not Found</h1>
        <p className="text-slate-400 text-sm mt-2">
          The requested sport could not be located in the Olympic registry.
        </p>
        <Link
          href="/sports-corner"
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold"
        >
          Return to Sports Corner
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back button */}
      <Link
        href="/sports-corner"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sports Directory
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur mb-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-bold">
                {sport.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                IOC CODE: {sport.code}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {sport.name}
            </h1>
            <p className="text-sm font-bold text-orange-400 mt-1">
              {sport.hindiName} &bull; Governed by {sport.governingBody}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed">
              {sport.overview}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <Link
              href={`/performance-log?sport=${encodeURIComponent(sport.name)}`}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Assess AI Performance for {sport.code}
            </Link>
          </div>
        </div>

        {/* Olympic Legacy Highlight */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-3">
          <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-white block font-semibold mb-0.5">
              Olympic Legacy & Indian Achievements:
            </strong>
            {sport.olympicHistory}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Official Rules & Regulations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Official Rules & Regulations</h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Structure: {sport.rules.matchStructure}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {sport.rules.summary}
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Key Match Regulations
              </h4>
              <ul className="space-y-2">
                {sport.rules.keyRegulations.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Violations & Penalties
              </h4>
              <ul className="space-y-1.5">
                {sport.rules.foulsAndPenalties.map((foul, idx) => (
                  <li key={idx} className="text-xs text-slate-400 pl-4 border-l-2 border-red-500/50">
                    {foul}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Pitch/Court Dimensions & Equipment */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Court & Equipment Dimensions</h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Surface: {sport.dimensions.surfaceType}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-orange-400 font-bold block mb-1">
                Arena / Pitch Dimensions:
              </span>
              <p className="text-slate-300">{sport.dimensions.courtPitchDimensions}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">
                Equipment Standards & Weights:
              </span>
              <p className="text-slate-300">{sport.dimensions.equipmentStandards}</p>
            </div>

            <div>
              <span className="font-bold text-slate-300 block mb-2 uppercase text-[11px] tracking-wider">
                Technical Specifications:
              </span>
              <ul className="space-y-1 text-slate-400">
                {sport.dimensions.technicalSpecifications.map((spec, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Scoring System & Tournament Formats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scoring System & Tournament Format</h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Format: {sport.scoring.format}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-1">Points Allocation:</strong>
              <p className="text-slate-300">{sport.scoring.pointsSystem}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-1">Tie-Breaker Mechanism:</strong>
              <p className="text-slate-300">{sport.scoring.tieBreaker}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-1">Tournament Progression:</strong>
              <p className="text-slate-300">{sport.scoring.tournamentProgression}</p>
            </div>
          </div>
        </div>

        {/* Section 4: National & International Benchmarks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Qualification Benchmarks</h2>
              <span className="text-[11px] text-slate-400 font-medium">
                From Grassroots to Olympic Standard
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Grassroots / District Level
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {sport.benchmarks.grassrootsDistrict}
              </p>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                🇮🇳 Khelo India Youth Games Standard
              </span>
              <p className="font-bold text-white mt-0.5">
                {sport.benchmarks.kheloIndiaYouth}
              </p>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Senior National Championship
              </span>
              <p className="font-bold text-white mt-0.5">
                {sport.benchmarks.seniorNational}
              </p>
            </div>

            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/30">
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                Olympic Entry Standard (MQS / Direct Quota)
              </span>
              <p className="font-bold text-white mt-0.5">
                {sport.benchmarks.olympicStandard}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to log performance */}
      <div className="mt-12 text-center p-8 bg-slate-900 border border-orange-500/30 rounded-3xl">
        <h3 className="text-xl font-bold text-white">
          Compete in {sport.name} with SportRise
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">
          Submit your official timing, weights, or match drills. Our AI engine will objectively grade your Skill Index and rank you against athletes nationwide.
        </p>
        <Link
          href={`/performance-log?sport=${encodeURIComponent(sport.name)}`}
          className="mt-5 inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 text-sm"
        >
          <Flame className="w-4 h-4" />
          Log Your Performance Now
        </Link>
      </div>
    </div>
  );
}
