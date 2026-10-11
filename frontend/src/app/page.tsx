"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Trophy,
  BarChart3,
  ShieldCheck,
  QrCode,
  Flame,
  ArrowRight,
  Target,
  Sparkles,
  MapPin,
  ChevronRight,
  School,
  Calendar,
} from "lucide-react";
import { OLYMPIC_SPORTS } from "../data/olympic-sports";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-600/20 via-amber-500/10 to-emerald-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-md shadow-orange-500/10">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Empowering Indian Grassroots Athletes 🇮🇳 खेल उत्थान
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Where Grassroots Talent Meets{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Olympic Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Digitize your athlete identity with official <span className="text-orange-400 font-semibold">SportRise IDs</span>, master IOC Olympic rulebooks, benchmark your drills with <span className="text-emerald-400 font-semibold">AI Skill Scoring</span>, and rise through district, state, and national leaderboards.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center gap-2 group"
            >
              <Award className="w-5 h-5" />
              Claim Your Athlete ID
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/events"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-orange-500/40 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10 hover:border-orange-500"
            >
              <Sparkles className="w-5 h-5 text-orange-400" />
              Explore Tournaments & Events
            </Link>

            <Link
              href="/sports-corner"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-base border border-slate-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <BookOpen className="w-5 h-5 text-orange-400" />
              Olympic Rules Corner
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
              <span className="block text-3xl font-black text-orange-400">36</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                States & UTs Covered
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
              <span className="block text-3xl font-black text-emerald-400">10+</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                Olympic Disciplines
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
              <span className="block text-3xl font-black text-amber-400">0 - 1000</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                AI Skill Index Standard
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
              <span className="block text-3xl font-black text-sky-400">100%</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                Objective Evaluation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Grassroots Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Four Pillars of Indian Athlete Empowerment
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Standardized, transparent, and technology-driven infrastructure designed to discover rural and urban talent across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-5 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Digital Athlete Passport</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every athlete receives a tamper-proof SportRise ID (e.g. <code className="text-orange-400">SR-IND-26-ATH-84920</code>) with a scannable verification QR code, district & state badges.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-6 text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Get Passport <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Olympic Rules Corner</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Official rulebooks, pitch/court dimensions, equipment standards, and benchmark criteria for Khelo India, Nationals, and the Olympics.
                </p>
              </div>
              <Link
                href="/sports-corner"
                className="mt-6 text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Explore Rulebooks <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Assessment Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Input sport-specific metrics (sprint times, snatch weights, agility scores) and let AI compute a calibrated 0-1000 Skill Index with targeted drills.
                </p>
              </div>
              <Link
                href="/performance-log"
                className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Assess Performance <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-sky-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dynamic Leaderboards</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track live ranks at the All-India, State, and District levels across U-14, U-17, U-19, and Senior categories with podium badges.
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="mt-6 text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                View Standings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Olympic Sports Directory Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Official Directory
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                Olympic Sports Recognized by IOC
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore official standards, pitch dimensions, and qualification benchmarks.
              </p>
            </div>
            <Link
              href="/sports-corner"
              className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View All Sports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OLYMPIC_SPORTS.slice(0, 6).map((sport) => (
              <Link
                key={sport.id}
                href={`/sports-corner/${sport.slug}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-semibold border border-slate-700">
                      {sport.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {sport.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors">
                    {sport.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {sport.hindiName}
                  </p>
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {sport.overview}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[180px]">{sport.governingBody}</span>
                  <span className="font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                    View Rules &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* School & College Tournaments Arena Section */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950/30 to-slate-900 border border-orange-500/30 p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <School className="w-3.5 h-3.5" />
                Inter-School & College Event Management
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Compete in Verified Educational Tournaments Across India
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover accredited athletics meets, inter-college football leagues, badminton championships, and academic competitions. Check automated eligibility and apply directly with individual or team rosters.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/events"
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  Browse Live & Upcoming Events
                </Link>
                <Link
                  href="/institution/register"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <School className="w-4 h-4 text-orange-400" />
                  Are You a School or College? Host an Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Athlete Onboarding Banner */}
      <section className="py-16 bg-gradient-to-r from-orange-950/40 via-slate-950 to-emerald-950/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-400 mb-4">
            <Flame className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Represent Your District and State?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Sign up in 2 minutes, verify your email with secure OTP, generate your official SportRise Athlete ID, and start logging your metrics today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all"
            >
              Register Athlete Now
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
