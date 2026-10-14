"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  Zap,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  Search,
} from "lucide-react";
import { SPORTS_CATEGORIES, SPORTS_CATALOGUE } from "../data/sports-catalogue";
import api from "@/lib/api";

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const res = await api.get("/events/public");
      if (res.data?.success && Array.isArray(res.data.events)) {
        // Prioritize the 2 Lucknow sample demo events
        const demoFirst = [...res.data.events].sort((a, b) => {
          const aIsDemo = a.name.includes("DEMO") || a.name.includes("Lucknow") ? 1 : 0;
          const bIsDemo = b.name.includes("DEMO") || b.name.includes("Lucknow") ? 1 : 0;
          return bIsDemo - aIsDemo;
        });
        setFeaturedEvents(demoFirst.slice(0, 3));
      }
    } catch (err) {
      console.warn("Could not fetch featured events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* =========================================================================
          HERO SECTION: Sophisticated Indian Tricolour Atmospheric Background & Olympic Spirit
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-slate-800/80">
        {/* Subtle Indian Tricolour Gradient Ambient Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Saffron / Deep Orange Aura (Top-Left) */}
          <div className="absolute -top-32 -left-32 w-[650px] h-[550px] bg-gradient-to-br from-orange-600/25 via-amber-500/15 to-transparent rounded-full blur-[140px]" />
          
          {/* White / Radiant Ashoka Light Aura (Center) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-sky-400/10 via-slate-100/5 to-transparent rounded-full blur-[160px]" />
          
          {/* India Green Aura (Bottom-Right) */}
          <div className="absolute -bottom-32 -right-32 w-[650px] h-[550px] bg-gradient-to-tl from-emerald-600/25 via-teal-500/15 to-transparent rounded-full blur-[140px]" />

          {/* Stadium Lights Beam Effect */}
          <div className="absolute top-0 left-1/4 w-[2px] h-[400px] bg-gradient-to-b from-orange-400/40 via-amber-300/10 to-transparent rotate-12 blur-[1px]" />
          <div className="absolute top-0 right-1/4 w-[2px] h-[400px] bg-gradient-to-b from-emerald-400/40 via-teal-300/10 to-transparent -rotate-12 blur-[1px]" />

          {/* Subtle Grid Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Indian Flag & National Sports Initiative Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-xl shadow-orange-500/10 backdrop-blur">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 animate-pulse" />
              <span>National Youth Sports Digitization Platform &bull; खेल उत्थान 🇮🇳</span>
            </div>

            {/* Main Required Hero Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
              India Plays.{" "}
              <span className="bg-gradient-to-r from-orange-400 via-white to-emerald-400 bg-clip-text text-transparent">
                SportRise Connects.
              </span>
            </h1>

            {/* Main Required Hero Subheading */}
            <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Discover sporting events, connect with institutions, showcase your talent, and compete for greatness.
            </p>

            {/* Olympic Spirit Visual Element (5 Interlocking Rings Motif with disclaimer) */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center -space-x-2 py-1">
                {/* Blue Ring */}
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-sky-400/80 shadow-sm shadow-sky-500/30" />
                {/* Yellow Ring */}
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-amber-400/80 shadow-sm shadow-amber-500/30 -translate-y-1" />
                {/* Slate Ring */}
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300/80 shadow-sm shadow-white/30" />
                {/* Green Ring */}
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-400/80 shadow-sm shadow-emerald-500/30 -translate-y-1" />
                {/* Red Ring */}
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-rose-500/80 shadow-sm shadow-rose-500/30" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Inspired by the Olympic & Khelo India Movement
              </span>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {/* Primary CTA */}
              <Link
                href="/events"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-2 group"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/institution/events/create"
                className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 hover:border-orange-500/60 transition-all flex items-center gap-2 shadow-xl backdrop-blur group"
              >
                <School className="w-5 h-5 text-orange-400" />
                <span>Host an Event</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Sports Catalogue CTA */}
              <Link
                href="/sports-corner"
                className="px-6 py-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-base border border-slate-800 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Sports Catalogue</span>
              </Link>
            </div>

            {/* Key Platform Stats Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur hover:border-orange-500/40 transition-colors">
                <span className="block text-3xl font-black text-orange-400">50+</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                  Olympic & Indian Sports
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur hover:border-emerald-500/40 transition-colors">
                <span className="block text-3xl font-black text-emerald-400">36</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                  States & UTs Covered
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur hover:border-amber-400/40 transition-colors">
                <span className="block text-3xl font-black text-amber-300">100%</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                  Free Grassroots IDs
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur hover:border-sky-400/40 transition-colors">
                <span className="block text-3xl font-black text-sky-400">Live</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 block">
                  Event Registrations
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Athlete Silhouettes & Sports Strip */}
          <div className="mt-16 pt-8 border-t border-slate-800/80">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              Empowering Athletes Across All Olympic & Indigenous Disciplines
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: "Athletics", emoji: "🏃‍♂️", desc: "Track & Field" },
                { name: "Badminton", emoji: "🏸", desc: "Singles & Doubles" },
                { name: "Cricket", emoji: "🏏", desc: "T20 & Multi-Day" },
                { name: "Field Hockey", emoji: "🏑", desc: "National Heritage" },
                { name: "Football", emoji: "⚽", desc: "11-a-side" },
                { name: "Boxing", emoji: "🥊", desc: "Ring Combat" },
                { name: "Wrestling", emoji: "🤼", desc: "Kushti & Akharas" },
                { name: "Archery", emoji: "🏹", desc: "Target Recurve" },
              ].map((s, idx) => (
                <Link
                  key={idx}
                  href={`/sports-corner`}
                  className="p-3 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-orange-500/50 rounded-2xl text-center transition-all group hover:-translate-y-1"
                >
                  <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                    {s.emoji}
                  </span>
                  <strong className="text-xs font-bold text-white block group-hover:text-orange-400 transition-colors truncate">
                    {s.name}
                  </strong>
                  <span className="text-[10px] text-slate-400 block truncate">{s.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED DEMO EVENTS SECTION (Lucknow Ongoing & Upcoming Competitions)
          ========================================================================= */}
      <section className="py-20 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" />
                Tournaments & Trials In Focus
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Featured Sporting Events Across India
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore live inter-collegiate championships and trial meets hosted by accredited institutions.
              </p>
            </div>

            <Link
              href="/events"
              className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* If events loaded, display them */}
            {featuredEvents.map((event) => {
              const isOngoing = event.dynamicStatus === "Ongoing";
              const isUpcoming = event.dynamicStatus === "Upcoming";
              const isDemo = event.name.includes("DEMO") || event.shortDescription?.includes("SAMPLE");

              return (
                <div
                  key={event.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 transition-all hover:-translate-y-1.5 flex flex-col justify-between shadow-xl relative overflow-hidden group"
                >
                  {/* Demo Event Top Banner */}
                  {isDemo && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-md">
                      Sample Data &bull; Demo Event
                    </div>
                  )}

                  <div>
                    {/* Status & Category Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {isOngoing ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Ongoing Now
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <Clock className="w-3 h-3" />
                          Upcoming
                        </span>
                      )}

                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-semibold border border-slate-700">
                        {event.sportGame}
                      </span>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors leading-snug">
                      {event.name.replace(" [DEMO EVENT]", "")}
                    </h3>

                    {/* Host Institution & Location */}
                    <p className="text-xs font-bold text-slate-300 mt-2 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-orange-400" />
                      <span>{event.hostingInstitution}</span>
                    </p>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="truncate">{event.venueName}, {event.city}</span>
                    </p>

                    {/* Short Description */}
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {event.shortDescription.replace(" [SAMPLE DATA]", "")}
                    </p>

                    {/* Pricing & Venue Payment Highlight */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                      {event.isPaid ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Entry Fee:</span>
                            <strong className="text-white font-mono text-sm">₹{event.registrationFee}</strong>
                          </div>
                          <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                            <IndianRupee className="w-3 h-3" />
                            Pay at Venue Enabled
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span className="text-slate-400">Registration:</span>
                          <span className="font-bold">100% Free Entry</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {event.isRegClosed ? (
                        <span className="text-amber-400 font-semibold">Reg Closed</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Registration Open</span>
                      )}
                    </span>

                    <Link
                      href={`/events/${event.id}`}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1 group-hover:gap-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SPORTS DIRECTORY PREVIEW (11 Categories A-K from Sports Catalogue)
          ========================================================================= */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" />
                Directory & Disciplines
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Comprehensive Sports Catalogue
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore official standards, Indian state hubs, and IOC/Paralympic classifications across 11 categories.
              </p>
            </div>

            <Link
              href="/sports-corner"
              className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
            >
              <span>Explore All Disciplines ({SPORTS_CATALOGUE.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPORTS_CATEGORIES.slice(0, 8).map((cat) => (
              <Link
                key={cat.code}
                href={`/sports-corner?category=${cat.code}`}
                className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Category {cat.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">Official IOC/SAI</span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.hindiName}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Browse Sports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR PILLARS OF INDIAN ATHLETE EMPOWERMENT
          ========================================================================= */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Grassroots Infrastructure
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
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-5 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Digital Athlete Passport</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every athlete receives a unique verified SportRise ID (e.g. <code className="text-orange-400">SR-IND-26-ATH-84920</code>) with a scannable verification QR code, district & state badges.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-6 text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Claim Athlete Passport <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
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
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
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
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-sky-500/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
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

      {/* =========================================================================
          INSTITUTION HOSTING BANNER: For Schools, Colleges & Sports Academies
          ========================================================================= */}
      <section className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-orange-500/30 p-8 sm:p-14 relative overflow-hidden shadow-2xl">
            {/* Background Tricolour Subtle Ribbons */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <School className="w-4 h-4" />
                <span>Inter-School, College & University Portal</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Host Your Next Sports Tournament on SportRise
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Publish verified inter-collegiate tournaments, manage athlete applications, configure online fees or <strong>&ldquo;Pay at Venue&rdquo;</strong> desks, and issue tamper-proof merit certificates to promising Indian talent.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/institution/events/create"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Host an Event Now</span>
                </Link>

                <Link
                  href="/institution/register"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <School className="w-4 h-4 text-orange-400" />
                  <span>Register Your Institution</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL ONBOARDING CALL TO ACTION
          ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-[#070b14] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3.5 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-400 mb-5 shadow-lg">
            <Flame className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Represent Your District and State?
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Register in under 2 minutes, verify your email with secure OTP, generate your official SportRise Athlete ID, and start competing in sanctioned tournaments today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
            >
              Claim Your Athlete ID
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-bold text-base border border-slate-700 transition-all hover:text-white"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
