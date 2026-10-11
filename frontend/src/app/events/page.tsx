"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Trophy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  School,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
  FileText,
  Flame,
  ChevronRight,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import api from "@/lib/api";

interface PublicEvent {
  id: string;
  name: string;
  category: string;
  sportGame: string;
  bannerImage?: string | null;
  shortDescription: string;
  organizer: string;
  hostingInstitution: string;
  startDate: string;
  endDate: string;
  regEndDate: string;
  reportingTime?: string | null;
  startTime?: string | null;
  venueName: string;
  city: string;
  state: string;
  minAge?: number | null;
  maxAge?: number | null;
  gender: string;
  participationType: string;
  isPaid: boolean;
  registrationFee: number;
  allowedInstitutionsType: string;
  dynamicStatus: "Upcoming" | "Ongoing" | "Completed";
  isRegClosed: boolean;
  applicationsCount: number;
  institution?: {
    id: string;
    name: string;
    type: string;
    logo?: string | null;
    city: string;
    state: string;
    isVerified: boolean;
  };
}

export default function StudentEventsMarketplace() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [pricingFilter, setPricingFilter] = useState<string>("All");
  const [externalOnly, setExternalOnly] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>("All");

  const tabs = [
    { id: "All", label: "All Events" },
    { id: "Upcoming", label: "Upcoming", badge: "Upcoming" },
    { id: "Ongoing", label: "Ongoing Now", badge: "Live" },
    { id: "Sports", label: "Sports & Tournaments" },
    { id: "Academic", label: "Academic Competitions" },
    { id: "Cultural", label: "Cultural Events" },
  ];

  const categories = [
    "All",
    "Athletics",
    "Football",
    "Cricket",
    "Basketball",
    "Badminton",
    "Chess",
    "Volleyball",
    "Esports",
    "Debate",
    "Quiz",
    "Cultural Event",
    "Academic Competition",
  ];

  const states = [
    "All",
    "Delhi",
    "Maharashtra",
    "Tamil Nadu",
    "Karnataka",
    "Haryana",
    "Punjab",
    "Uttar Pradesh",
    "Gujarat",
    "Kerala",
    "West Bengal",
    "Rajasthan",
  ];

  useEffect(() => {
    fetchEvents();
  }, [activeTab, categoryFilter, pricingFilter, externalOnly, selectedState]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== "All") params.tab = activeTab;
      if (categoryFilter !== "All") params.category = categoryFilter;
      if (pricingFilter === "Free") params.freePaid = "free";
      if (pricingFilter === "Paid") params.freePaid = "paid";
      if (externalOnly) params.externalOnly = "true";
      if (selectedState !== "All") params.state = selectedState;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/events/public", { params });
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch public events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  // Filtered in memory for instant feedback on typing
  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.sportGame.toLowerCase().includes(q) ||
        e.hostingInstitution.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
    );
  }, [events, search]);

  const ongoingCount = events.filter((e) => e.dynamicStatus === "Ongoing").length;
  const upcomingCount = events.filter((e) => e.dynamicStatus === "Upcoming").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Inter-School & College Arena
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Upcoming & Ongoing <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Events</span>
              </h1>
              <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
                Discover verified school and college sports tournaments, athletics meets, and academic competitions. Verify your eligibility and apply directly.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/events/my-applications"
                prefetch={true}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 text-sm font-bold transition-all shadow-sm"
              >
                <FileText className="w-4 h-4 text-orange-400" />
                Track My Applications
              </Link>

              <Link
                href="/institution/register"
                prefetch={true}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
              >
                <School className="w-4 h-4" />
                Host an Event
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live & Ongoing</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-2xl font-black text-white">{ongoingCount}</p>
                <span className="text-xs text-emerald-400 font-bold ml-auto">Now Active</span>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Upcoming Events</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-sky-400" />
                <p className="text-2xl font-black text-white">{upcomingCount}</p>
                <span className="text-xs text-sky-400 font-bold ml-auto">Open Soon</span>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verified Hosts</p>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <p className="text-2xl font-black text-white">100%</p>
                <span className="text-xs text-amber-400 font-bold ml-auto">Accredited</span>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registration Fee</p>
              <div className="flex items-center gap-2 mt-1">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <p className="text-xl font-black text-white">Free & Paid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-sky-500/20 text-sky-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filters Row */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, sport, hosting school or city..."
              className="w-full pl-11 pr-24 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/60 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchEvents();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-3 pr-8 focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-950 text-white">
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* State Dropdown */}
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-3 pr-8 focus:outline-none focus:border-orange-500"
              >
                {states.map((s) => (
                  <option key={s} value={s} className="bg-slate-950 text-white">
                    {s === "All" ? "All States" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="relative">
              <select
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-3 pr-8 focus:outline-none focus:border-orange-500"
              >
                <option value="All" className="bg-slate-950 text-white">All Pricing</option>
                <option value="Free" className="bg-slate-950 text-white">Free Only</option>
                <option value="Paid" className="bg-slate-950 text-white">Paid Entry</option>
              </select>
            </div>

            {/* External Allowed Toggle */}
            <button
              onClick={() => setExternalOnly(!externalOnly)}
              className={`flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold border transition-all ${
                externalOnly
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${externalOnly ? "text-amber-400" : "text-slate-500"}`} />
              External Students Allowed
            </button>
          </div>
        </div>

        {/* Results Count & Active Filters Indicator */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <p>
            Showing <span className="font-bold text-white">{filteredEvents.length}</span> published event
            {filteredEvents.length === 1 ? "" : "s"}
          </p>
          {(categoryFilter !== "All" || pricingFilter !== "All" || selectedState !== "All" || externalOnly || search) && (
            <button
              onClick={() => {
                setCategoryFilter("All");
                setPricingFilter("All");
                setSelectedState("All");
                setExternalOnly(false);
                setSearch("");
              }}
              className="text-orange-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex flex-col p-4"
              >
                <div className="h-44 bg-slate-800 rounded-xl mb-4" />
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="mt-auto h-10 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-12 text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Events Found</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find any events matching your criteria. Try adjusting your search query, state, or category filters.
            </p>
            <button
              onClick={() => {
                setActiveTab("All");
                setCategoryFilter("All");
                setPricingFilter("All");
                setSelectedState("All");
                setExternalOnly(false);
                setSearch("");
              }}
              className="mt-6 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredEvents.map((evt) => {
              const startDateFormatted = new Date(evt.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const endDateFormatted = new Date(evt.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={evt.id}
                  className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:shadow-orange-500/5 hover:-translate-y-1"
                >
                  {/* Banner Image or Gradient Header */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950">
                    {evt.bannerImage ? (
                      <img
                        src={evt.bannerImage}
                        alt={evt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950">
                        <Trophy className="w-12 h-12 text-orange-400/40 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs uppercase tracking-widest font-black text-orange-400/70">
                          {evt.category}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                    {/* Top Status & Fee Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      {/* Dynamic Status Badge */}
                      {evt.dynamicStatus === "Ongoing" ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          Ongoing Now
                        </span>
                      ) : evt.isRegClosed ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-amber-500/90 text-slate-950 backdrop-blur-md">
                          <Clock className="w-3 h-3" />
                          Reg Closed
                        </span>
                      ) : evt.dynamicStatus === "Upcoming" ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-sky-500/90 text-white backdrop-blur-md">
                          <Calendar className="w-3 h-3" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-700/90 text-slate-300">
                          Completed
                        </span>
                      )}

                      {/* Fee Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black backdrop-blur-md shadow-md ${
                          evt.isPaid
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {evt.isPaid ? `₹${evt.registrationFee}` : "FREE ENTRY"}
                      </span>
                    </div>

                    {/* Category pill bottom left */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-orange-400">
                        {evt.sportGame || evt.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Hosting Institution with Verified Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <School className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <p className="text-xs font-bold text-slate-300 truncate">
                        {evt.hostingInstitution}
                      </p>
                      {evt.institution?.isVerified && (
                        <span title="Verified Institution" className="flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        </span>
                      )}
                    </div>

                    {/* Event Name */}
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-2">
                      {evt.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {evt.shortDescription}
                    </p>

                    {/* Key Details Grid */}
                    <div className="space-y-2 mb-5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span>
                          {startDateFormatted} {startDateFormatted !== endDateFormatted ? `– ${endDateFormatted}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">
                          {evt.venueName}{evt.city ? `, ${evt.city}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-[11px] text-slate-400 truncate">
                          {evt.minAge || evt.maxAge
                            ? `Ages ${evt.minAge || "Any"}–${evt.maxAge || "Any"}`
                            : "All Ages"}{" "}
                          • {evt.gender} • {evt.participationType}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-800 flex items-center gap-2">
                      <Link
                        href={`/events/${evt.id}`}
                        prefetch={true}
                        className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
                      >
                        View Details
                      </Link>

                      <Link
                        href={`/events/${evt.id}?apply=true`}
                        prefetch={true}
                        className={`flex-1 text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                          evt.isRegClosed
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                            : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20"
                        }`}
                      >
                        <span>{evt.isRegClosed ? "Closed" : "Apply Now"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Institution Call to Action Banner */}
        <div className="mt-16 rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/20 relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              For Schools, Colleges & Sports Academies
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Host your next tournament on SPORTRISE
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Publish inter-school tournaments, track registrations, verify student eligibility automatically, and manage fixtures all in one centralized platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/institution/register"
                prefetch={true}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
              >
                Register Your Institution
              </Link>
              <Link
                href="/institution/login"
                prefetch={true}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-sm font-bold transition-colors"
              >
                Institution Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
