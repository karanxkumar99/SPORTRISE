"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  School,
  Share2,
  Mail,
  Phone,
  ArrowLeft,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  Info,
  Check,
  Award,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import EventApplicationModal from "@/components/events/EventApplicationModal";

interface Round {
  name: string;
  date?: string;
  time?: string;
  venue?: string;
  description?: string;
}

interface EventDocument {
  name: string;
  url: string;
  type?: string;
}

interface EventData {
  id: string;
  name: string;
  category: string;
  sportGame: string;
  bannerImage?: string | null;
  shortDescription: string;
  fullDescription?: string | null;
  organizer: string;
  hostingInstitution: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  regStartDate: string;
  regEndDate: string;
  startDate: string;
  endDate: string;
  reportingTime?: string | null;
  startTime?: string | null;
  duration?: string | null;
  venueName: string;
  venueAddress?: string | null;
  city: string;
  state: string;
  rounds?: Round[];
  allowedInstitutionsType: string;
  minAge?: number | null;
  maxAge?: number | null;
  gender: string;
  classGrade?: string | null;
  collegeYear?: string | null;
  courseDepartment?: string | null;
  skillRequirement?: string | null;
  participationType: string;
  teamMinSize?: number | null;
  teamMaxSize?: number | null;
  customEligibility?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameFormat?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any;
  documents?: EventDocument[];
  isPaid: boolean;
  registrationFee: number;
  gstPercent: number;
  paymentDeadline?: string | null;
  refundPolicy?: string | null;
  dynamicStatus: "Upcoming" | "Ongoing" | "Completed";
  isRegClosed: boolean;
  applicationsCount: number;
  institution?: {
    id: string;
    name: string;
    type: string;
    logo?: string | null;
    address?: string | null;
    city: string;
    state: string;
    website?: string | null;
    contactNumber?: string | null;
    coordinatorName?: string | null;
    coordinatorEmail?: string | null;
    coordinatorPhone?: string | null;
    isVerified: boolean;
  };
}

function EventDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const eventId = params.id as string;
  const autoApply = searchParams.get("apply") === "true";

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "schedule" | "rules" | "documents">("about");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Eligibility Tester State
  const [testAge, setTestAge] = useState<string>("17");
  const [testGender, setTestGender] = useState<string>(user?.gender || "Male");
  const [testInstName, setTestInstName] = useState<string>("");
  const [eligibilityResult, setEligibilityResult] = useState<{
    tested: boolean;
    isEligible: boolean;
    reasons: string[];
  }>({ tested: false, isEligible: true, reasons: [] });

  useEffect(() => {
    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  useEffect(() => {
    if (autoApply && event && !event.isRegClosed) {
      setIsApplyModalOpen(true);
    }
  }, [autoApply, event]);

  const fetchEventDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/detail/${eventId}`);
      if (res.data?.success && res.data.event) {
        setEvent(res.data.event);
        // Run initial eligibility check
        checkUserEligibility(res.data.event, testAge, testGender, testInstName);
      } else {
        setError("Event not found.");
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserEligibility = (
    evt: EventData,
    ageStr: string,
    genderVal: string,
    instVal: string
  ) => {
    const reasons: string[] = [];
    const ageNum = parseInt(ageStr, 10);

    if (evt.minAge && ageNum < evt.minAge) {
      reasons.push(`Minimum age required is ${evt.minAge} years (entered: ${ageNum}).`);
    }
    if (evt.maxAge && ageNum > evt.maxAge) {
      reasons.push(`Maximum age limit is ${evt.maxAge} years (entered: ${ageNum}).`);
    }
    if (evt.gender && evt.gender !== "All") {
      if (genderVal.toLowerCase() !== evt.gender.toLowerCase()) {
        reasons.push(`Event restricted to ${evt.gender} participants.`);
      }
    }
    if (evt.allowedInstitutionsType === "only_ours") {
      if (!instVal.toLowerCase().includes(evt.hostingInstitution.toLowerCase())) {
        reasons.push(`Reserved exclusively for students of ${evt.hostingInstitution}.`);
      }
    }

    setEligibilityResult({
      tested: true,
      isEligible: reasons.length === 0,
      reasons,
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-semibold">Loading official event portal...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Event Not Available</h2>
          <p className="text-xs text-slate-400 mt-2">{error || "Could not find event details."}</p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Events
          </Link>
        </div>
      </div>
    );
  }

  const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateFormatted = new Date(event.endDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const regDeadlineFormatted = new Date(event.regEndDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Breadcrumb & Actions */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Events</span>
            <span className="text-slate-600">/</span>
            <span className="text-orange-400 truncate max-w-[200px] sm:max-w-xs">{event.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              {copiedLink ? "Link Copied!" : "Share Event"}
            </button>
            <Link
              href="/events/my-applications"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              My Applications
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Banner + Title + Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Media Graphic or Banner */}
              <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950">
                {event.bannerImage ? (
                  <img
                    src={event.bannerImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-orange-950/40 via-slate-900 to-slate-950">
                    <Trophy className="w-16 h-16 text-orange-400/40 mb-3" />
                    <span className="text-sm font-black uppercase tracking-widest text-orange-400/70">
                      Official Tournament Edition
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />

                {/* Floating dynamic badges on banner */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.dynamicStatus === "Ongoing" ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-emerald-500 text-white shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Ongoing Tournament
                      </span>
                    ) : event.isRegClosed ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-amber-500 text-slate-950 shadow-lg flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Registration Closed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-sky-500 text-white shadow-lg flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Upcoming Event
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200">
                      {event.category}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black backdrop-blur-md ${
                      event.isPaid
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {event.isPaid ? `Entry: ₹${event.registrationFee}` : "Free Registration"}
                  </span>
                </div>

                {/* Bottom Institution Title */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center p-1.5 backdrop-blur-md flex-shrink-0">
                    <School className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white truncate">{event.hostingInstitution}</p>
                      {event.institution?.isVerified && (
                        <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {event.venueName}, {event.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Name & Short Overview */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {event.name}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                  {event.shortDescription}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Sport / Game</p>
                  <p className="text-sm font-black text-orange-400 mt-0.5 truncate">{event.sportGame}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Participation</p>
                  <p className="text-sm font-black text-white mt-0.5 truncate">{event.participationType}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Eligible Age</p>
                  <p className="text-sm font-black text-white mt-0.5 truncate">
                    {event.minAge || event.maxAge ? `${event.minAge || "Any"} - ${event.maxAge || "Any"} Yrs` : "All Ages"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Registered</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5 truncate">
                    {event.applicationsCount} Athletes
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Sticky Registration & Schedule Box */}
            <div className="lg:col-span-4 sticky top-32 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Registration Fee</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-white">
                        {event.isPaid ? `₹${event.registrationFee}` : "Free"}
                      </span>
                      {event.isPaid && event.gstPercent > 0 && (
                        <span className="text-xs text-slate-400">+{event.gstPercent}% GST</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      event.isRegClosed
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {event.isRegClosed ? "Closed" : "Registration Open"}
                  </span>
                </div>

                {/* Important Dates */}
                <div className="py-4 space-y-3 text-xs border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Deadline:
                    </span>
                    <span className="font-bold text-white">{regDeadlineFormatted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      Starts On:
                    </span>
                    <span className="font-bold text-white">{startDateFormatted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Ends On:
                    </span>
                    <span className="font-bold text-white">{endDateFormatted}</span>
                  </div>

                  {event.reportingTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        Reporting:
                      </span>
                      <span className="font-bold text-white">{event.reportingTime}</span>
                    </div>
                  )}
                </div>

                {/* Venue Quick Look with Google Maps Directions */}
                <div className="py-4 space-y-2 text-xs border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Venue Location
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${event.venueAddress || event.venueName}, ${event.city}, ${event.state}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 hover:text-orange-300 font-bold text-[11px] flex items-center gap-1 hover:underline"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="font-bold text-white text-sm">{event.venueName}</p>
                  <p className="text-slate-400 text-xs">
                    {event.venueAddress || event.venueName}, {event.city}, {event.state}
                  </p>
                </div>

                {/* Apply Button CTA */}
                <div className="pt-5 space-y-3">
                  <button
                    disabled={event.isRegClosed}
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{event.isRegClosed ? "Registration Closed" : "Register / Apply Now"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Instant registration confirmation with verified Application Number.
                  </p>
                </div>
              </div>

              {/* Institution Quick Info */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-orange-400" />
                  <p className="font-bold text-white">{event.hostingInstitution}</p>
                </div>
                <p className="text-slate-400">
                  Contact: <span className="text-slate-200">{event.contactPerson}</span> ({event.contactEmail})
                </p>
                {event.contactPhone && (
                  <p className="text-slate-400">
                    Phone: <span className="text-slate-200">{event.contactPhone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections (Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "about", label: "About & Format" },
            { id: "schedule", label: "Schedule & Rounds" },
            { id: "rules", label: "Rules & Eligibility" },
            { id: "documents", label: "Downloads & Attachments" },
          ].map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: About & Format */}
        {activeTab === "about" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Full Description */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-400" />
                  About the Event
                </h2>
                <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                  {event.fullDescription || event.shortDescription}
                </div>
              </div>

              {/* Game / Match Format */}
              {event.gameFormat && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Game & Tournament Format
                  </h2>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs">
                    {typeof event.gameFormat === "string"
                      ? event.gameFormat
                      : JSON.stringify(event.gameFormat, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Automated Eligibility Checker Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Instant Eligibility Checker
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Verify whether you meet the age, gender, and institution guidelines before registering.
                </p>

                {/* Test Inputs */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Your Age (Years)
                    </label>
                    <input
                      type="number"
                      value={testAge}
                      onChange={(e) => {
                        setTestAge(e.target.value);
                        checkUserEligibility(event, e.target.value, testGender, testInstName);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Your Gender
                    </label>
                    <select
                      value={testGender}
                      onChange={(e) => {
                        setTestGender(e.target.value);
                        checkUserEligibility(event, testAge, e.target.value, testInstName);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Eligibility Result Banner */}
                {eligibilityResult.tested && (
                  <div
                    className={`p-4 rounded-2xl border text-xs ${
                      eligibilityResult.isEligible
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {eligibilityResult.isEligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>You Are Eligible!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Eligibility Attention</span>
                        </>
                      )}
                    </div>
                    {eligibilityResult.isEligible ? (
                      <p className="text-[11px] text-emerald-400/90">
                        You satisfy all criteria. Feel free to submit your application now.
                      </p>
                    ) : (
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-300 mt-2">
                        {eligibilityResult.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Schedule & Rounds */}
        {activeTab === "schedule" && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Tournament Schedule & Fixtures
              </h2>

              {event.rounds && event.rounds.length > 0 ? (
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pl-6">
                  {event.rounds.map((round, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-slate-900" />
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                            {round.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {round.date && <span>{round.date}</span>}
                            {round.time && <span>• {round.time}</span>}
                          </div>
                        </div>

                        {round.venue && (
                          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {round.venue}
                          </p>
                        )}

                        {round.description && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {round.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>Detailed match-by-match schedule will be announced following registration closure.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Rules & Eligibility */}
        {activeTab === "rules" && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                Official Rules & Regulations
              </h2>

              {event.rules ? (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/70 p-5 rounded-2xl border border-slate-800 font-mono text-xs">
                  {typeof event.rules === "string"
                    ? event.rules
                    : JSON.stringify(event.rules, null, 2)}
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <p>1. Participants must carry a valid School/College Photo ID card on the day of the event.</p>
                  <p>2. Reporting time is strict. Failure to report 30 minutes before match time may lead to walkover.</p>
                  <p>3. Fair play and sportsmanship must be maintained at all times. Obscene language or conduct will result in immediate disqualification.</p>
                  <p>4. Referee/Umpire decisions are final and binding on all participating athletes and teams.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Documents & Downloads */}
        {activeTab === "documents" && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-orange-400" />
                Downloadable Event Documents
              </h2>

              {event.documents && event.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                          <p className="text-[11px] text-slate-400 uppercase">{doc.type || "PDF / DOC"}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>No downloadable brochure files attached for this event yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Registration Modal */}
      {isApplyModalOpen && (
        <EventApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          event={{
            id: event.id,
            name: event.name,
            category: event.category,
            sportGame: event.sportGame,
            hostingInstitution: event.hostingInstitution,
            participationType: event.participationType,
            teamMinSize: event.teamMinSize,
            teamMaxSize: event.teamMaxSize,
            isPaid: event.isPaid,
            registrationFee: event.registrationFee,
          }}
          onSuccess={() => {
            fetchEventDetail();
          }}
        />
      )}
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}
