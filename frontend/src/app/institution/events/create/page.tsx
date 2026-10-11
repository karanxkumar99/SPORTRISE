"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "../../../../lib/institution-context";
import api from "../../../../lib/api";
import InstitutionSidebar from "../../../../components/institution/InstitutionSidebar";
import { ALL_INDIAN_STATES } from "../../../../data/india-locations";
import {
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  Upload,
  Eye,
  Plus,
  Trash2,
  Award,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { getCurrentGPSCoordinates, reverseGeocodeCoordinates } from "@/lib/location-utils";

const EVENT_CATEGORIES = [
  "Sports Tournament",
  "Athletics",
  "Football",
  "Cricket",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Chess",
  "Esports",
  "Debate",
  "Quiz",
  "Cultural Event",
  "Academic Competition",
  "Other",
];

const STEPS = [
  "Basic Information",
  "Schedule & Venue",
  "Eligibility",
  "Game Format",
  "Rules & Regulations",
  "Registration & Fee",
  "Documents",
  "Preview & Publish",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { institution } = useInstitution();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  // Step 1: Basic Information
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sports Tournament");
  const [sportGame, setSportGame] = useState("Athletics");
  const [bannerImage, setBannerImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [organizer, setOrganizer] = useState(institution?.name || "");
  const [hostingInstitution, setHostingInstitution] = useState(institution?.name || "");
  const [contactPerson, setContactPerson] = useState(institution?.coordinatorName || "");
  const [contactEmail, setContactEmail] = useState(institution?.coordinatorEmail || "");
  const [contactPhone, setContactPhone] = useState(institution?.coordinatorPhone || "");

  // Step 2: Schedule & Venue
  const [regStartDate, setRegStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [regEndDate, setRegEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 22 * 86400000).toISOString().slice(0, 10)
  );
  const [reportingTime, setReportingTime] = useState("08:00 AM");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [duration, setDuration] = useState("3 Days");
  const [venueName, setVenueName] = useState(institution?.name ? `${institution.name} Sports Ground` : "");
  const [venueAddress, setVenueAddress] = useState(institution?.address || "");
  const [city, setCity] = useState(institution?.city || "New Delhi");
  const [state, setState] = useState(institution?.state || "Delhi (NCT)");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [fetchingVenueLoc, setFetchingVenueLoc] = useState(false);
  const [venueLocMsg, setVenueLocMsg] = useState<string | null>(null);

  const handleFetchVenueLocation = async () => {
    setFetchingVenueLoc(true);
    setVenueLocMsg(null);
    try {
      const coords = await getCurrentGPSCoordinates();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      const geocoded = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      if (geocoded.address) setVenueAddress(geocoded.address);
      if (geocoded.city) setCity(geocoded.city);
      if (geocoded.state) setState(geocoded.state);
      setVenueLocMsg(`Venue detected: ${geocoded.formattedAddress}`);
    } catch (err: unknown) {
      alert((err as Error).message || "Could not detect venue location.");
    } finally {
      setFetchingVenueLoc(false);
    }
  };

  const [rounds, setRounds] = useState<Array<{ roundNumber: number; name: string; date: string; desc: string }>>([
    { roundNumber: 1, name: "Qualification Round / Heats", date: "Day 1", desc: "Preliminary rounds" },
    { roundNumber: 2, name: "Quarter & Semi-Finals", date: "Day 2", desc: "Top performers advance" },
    { roundNumber: 3, name: "Championship Finals", date: "Day 3", desc: "Podium medal matches" },
  ]);

  // Step 3: Participation & Eligibility
  const [allowedInstitutionsType, setAllowedInstitutionsType] = useState("any");
  const [minAge, setMinAge] = useState<string>("14");
  const [maxAge, setMaxAge] = useState<string>("19");
  const [gender, setGender] = useState("All");
  const [classGrade, setClassGrade] = useState("Classes 9 to 12");
  const [collegeYear, setCollegeYear] = useState("All Years");
  const [courseDepartment, setCourseDepartment] = useState("All Departments");
  const [participationType, setParticipationType] = useState("Individual");
  const [teamMinSize, setTeamMinSize] = useState<string>("5");
  const [teamMaxSize, setTeamMaxSize] = useState<string>("11");
  const [skillRequirement, setSkillRequirement] = useState("Open for all grassroots & school athletes");
  const [customEligibility, setCustomEligibility] = useState(
    "Students aged 14–19 studying in recognized schools/colleges with valid ID proof."
  );

  // Step 4: Game Format
  const [matchFormat, setMatchFormat] = useState("Knockout Tournament");
  const [scoringSystem, setScoringSystem] = useState("Standard Federation Points Rule");
  const [prizes, setPrizes] = useState("Gold, Silver & Bronze Medals, Cash Prizes & Trophies");
  const [certificates, setCertificates] = useState("Official Merit & Participation Certificates for all participants");
  const [importantInstructions, setImportantInstructions] = useState(
    "Reporting at least 45 minutes prior to scheduled match time is mandatory. Original school/college ID required."
  );

  // Step 5: Rules & Regulations
  const [generalRules, setGeneralRules] = useState([
    "Valid school/college identity card mandatory during verification.",
    "Official sports attire / shoes compulsory.",
    "Fair play and strict sportsmanship must be upheld at all times.",
  ]);
  const [newRuleInput, setNewRuleInput] = useState("");
  const [codeOfConduct, setCodeOfConduct] = useState(
    "Any abusive language, misconduct, or age falsification leads to immediate debarment."
  );
  const [cancellationPolicy, setCancellationPolicy] = useState(
    "In case of extreme weather, matches will be rescheduled to backup indoor courts."
  );

  // Step 6: Registration & Fee
  const [isPaid, setIsPaid] = useState(false);
  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(0);
  const [refundPolicy, setRefundPolicy] = useState("Full refund if event is cancelled by organizing committee.");
  const [visibility, setVisibility] = useState("Public");
  const [status, setStatus] = useState("Published");

  // Step 7: Documents
  const [brochureUrl, setBrochureUrl] = useState("");
  const [rulebookUrl, setRulebookUrl] = useState("");
  const [scheduleUrl, setScheduleUrl] = useState("");

  const addRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        name: `Round ${rounds.length + 1}`,
        date: "TBD",
        desc: "Match details",
      },
    ]);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const addRule = () => {
    if (newRuleInput.trim()) {
      setGeneralRules([...generalRules, newRuleInput.trim()]);
      setNewRuleInput("");
    }
  };

  const removeRule = (index: number) => {
    setGeneralRules(generalRules.filter((_, i) => i !== index));
  };

  const handlePublish = async (actionStatus = "Published") => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        category,
        sportGame,
        bannerImage: bannerImage || undefined,
        shortDescription,
        fullDescription,
        organizer: organizer || institution?.name,
        hostingInstitution: hostingInstitution || institution?.name,
        contactPerson: contactPerson || institution?.coordinatorName,
        contactEmail: contactEmail || institution?.coordinatorEmail,
        contactPhone: contactPhone || institution?.coordinatorPhone,
        regStartDate,
        regEndDate,
        startDate,
        endDate,
        reportingTime,
        startTime,
        duration,
        venueName,
        venueAddress,
        city,
        state,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        rounds,
        allowedInstitutionsType,
        minAge: minAge ? parseInt(minAge, 10) : undefined,
        maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
        gender,
        classGrade,
        collegeYear,
        courseDepartment,
        skillRequirement,
        participationType,
        teamMinSize: participationType === "Team" ? parseInt(teamMinSize, 10) : undefined,
        teamMaxSize: participationType === "Team" ? parseInt(teamMaxSize, 10) : undefined,
        customEligibility,
        gameFormat: {
          matchFormat,
          scoringSystem,
          prizes,
          certificates,
          importantInstructions,
        },
        rules: {
          generalRules,
          codeOfConduct,
          cancellationPolicy,
        },
        documents: [
          ...(brochureUrl ? [{ title: "Event Brochure", url: brochureUrl }] : []),
          ...(rulebookUrl ? [{ title: "Official Rulebook", url: rulebookUrl }] : []),
          ...(scheduleUrl ? [{ title: "Detailed Schedule", url: scheduleUrl }] : []),
        ],
        isPaid,
        registrationFee,
        gstPercent,
        refundPolicy,
        visibility,
        status: actionStatus,
      };

      const res = await api.post("/events/create", payload);

      if (res.data?.success) {
        router.push("/institution/events");
      } else {
        setError(res.data?.message || "Failed to create event.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to publish event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
        {/* Wizard Header & Progress Bar */}
        <div className="mb-8 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Multi-Step Event Creation Wizard
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {Math.round((currentStep / STEPS.length) * 100)}% Complete
              </span>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step Pills */}
          <div className="hidden lg:grid grid-cols-8 gap-1 mt-4 text-[11px] text-center">
            {STEPS.map((step, idx) => (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(idx + 1)}
                className={`p-1.5 rounded-lg font-semibold truncate transition-colors ${
                  currentStep === idx + 1
                    ? "bg-blue-600 text-white"
                    : idx + 1 < currentStep
                    ? "bg-slate-950 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-500"
                }`}
              >
                {idx + 1}. {step.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Forms */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white mb-4">
                Step 1: Basic Event Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15th National Inter-School Athletics Championship 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Category <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sport / Game / Discipline Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100m Sprint & Long Jump"
                    value={sportGame}
                    onChange={(e) => setSportGame(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Banner Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Description (For Event Cards) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-2 line summary highlighting the tournament"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Event Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Complete detailed writeup of the tournament, organizers, and legacy..."
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Schedule & Venue */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white mb-4">
                Step 2: Schedule, Timings & Venue
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration Start Date
                  </label>
                  <input
                    type="date"
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration Deadline (End Date) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={regEndDate}
                    onChange={(e) => setRegEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Start Date <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event End Date <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reporting Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:30 AM"
                    value={reportingTime}
                    onChange={(e) => setReportingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Start Time & Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-3 py-3 text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 3 Days"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-3 py-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Venue Name <span className="text-orange-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchVenueLocation}
                      disabled={fetchingVenueLoc}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                    >
                      {fetchingVenueLoc ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <LocateFixed className="w-3.5 h-3.5" />
                          <span>Fetch Venue Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  {venueLocMsg && (
                    <p className="text-[11px] text-emerald-400 mb-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      {venueLocMsg}
                    </p>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major Dhyan Chand National Stadium"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Complete Venue Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Gate Number, Landmark"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Rounds & Matches Builder */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Tournament Rounds / Schedule Stages
                  </h3>
                  <button
                    type="button"
                    onClick={addRound}
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg font-semibold flex items-center gap-1 border border-blue-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Round
                  </button>
                </div>

                <div className="space-y-3">
                  {rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Round Title"
                        value={round.name}
                        onChange={(e) => {
                          const updated = [...rounds];
                          updated[idx].name = e.target.value;
                          setRounds(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Date/Time (e.g. Day 1)"
                        value={round.date}
                        onChange={(e) => {
                          const updated = [...rounds];
                          updated[idx].date = e.target.value;
                          setRounds(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Description / Timings"
                        value={round.desc}
                        onChange={(e) => {
                          const updated = [...rounds];
                          updated[idx].desc = e.target.value;
                          setRounds(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeRound(idx)}
                        className="text-red-400 hover:text-red-300 p-2 text-xs flex items-center justify-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Participation & Eligibility */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white mb-4">
                Step 3: Participation & Eligibility Criteria
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Who can participate? <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={allowedInstitutionsType}
                    onChange={(e) => setAllowedInstitutionsType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="any">Students from any school/college (Open National)</option>
                    <option value="only_ours">Only students from our institution</option>
                    <option value="external_allowed">External participants allowed</option>
                    <option value="selected">Students from selected institutions</option>
                    <option value="invite_only">Invite-only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Participation Format
                  </label>
                  <select
                    value={participationType}
                    onChange={(e) => setParticipationType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="Individual">Individual Participation</option>
                    <option value="Team">Team Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age Bracket (Min & Max Age)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min Age (e.g. 14)"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Max Age (e.g. 19)"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Eligible Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="All">All Genders (Open / Mixed)</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Class / Grade Level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Classes 9 to 12"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College Year / Course
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Undergraduates (1st to 4th Year)"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                {participationType === "Team" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Team Squad Requirements
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min Team Size (e.g. 5)"
                        value={teamMinSize}
                        onChange={(e) => setTeamMinSize(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Max Team Size (e.g. 11)"
                        value={teamMaxSize}
                        onChange={(e) => setTeamMaxSize(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Eligibility Summary (Student-Facing)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Students aged 14–18 studying in Classes 9–12 are eligible."
                    value={customEligibility}
                    onChange={(e) => setCustomEligibility(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Game Format */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white mb-4">
                Step 4: Game & Match Format
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tournament & Match Format
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Knockout with 3rd Place Playoff / Round Robin"
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scoring System & Tie-Breaker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. World Athletics FAT timing / BWF 21-point rally / FIFA extra-time"
                    value={scoringSystem}
                    onChange={(e) => setScoringSystem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prizes, Awards & Medals
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Trophies, Gold/Silver/Bronze medals, Cash scholarships, sponsor hampers"
                    value={prizes}
                    onChange={(e) => setPrizes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Certificates Offered
                  </label>
                  <input
                    type="text"
                    placeholder="Merit certificates for winners, participation certificates for all"
                    value={certificates}
                    onChange={(e) => setCertificates(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Important Instructions & Reporting Protocol
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reporting instructions, warm-up schedules, equipment inspections..."
                    value={importantInstructions}
                    onChange={(e) => setImportantInstructions(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Rules & Regulations */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white mb-4">
                Step 5: Rules & Regulations
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  General Tournament Rules (Add Unlimited Rules)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type a new rule and press Add..."
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                  >
                    Add Rule
                  </button>
                </div>

                <ul className="space-y-2">
                  {generalRules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        {rule}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRule(idx)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Code of Conduct & Disqualification
                  </label>
                  <textarea
                    rows={3}
                    value={codeOfConduct}
                    onChange={(e) => setCodeOfConduct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Weather / Cancellation Policy
                  </label>
                  <textarea
                    rows={3}
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Registration & Fee */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white mb-4">
                Step 6: Registration Fee & Visibility
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Fee Structure
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="radio"
                        checked={!isPaid}
                        onChange={() => {
                          setIsPaid(false);
                          setRegistrationFee(0);
                        }}
                      />
                      <span className="text-xs font-bold text-white">Free Event (₹0)</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="radio"
                        checked={isPaid}
                        onChange={() => setIsPaid(true)}
                      />
                      <span className="text-xs font-bold text-white">Paid Registration</span>
                    </label>
                  </div>
                </div>

                {isPaid && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Registration Fee per Athlete / Team (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 250"
                        value={registrationFee}
                        onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        GST / Taxes (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 0 or 18"
                        value={gstPercent}
                        onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Refund Policy
                      </label>
                      <input
                        type="text"
                        value={refundPolicy}
                        onChange={(e) => setRefundPolicy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="Public">Public (Listed on Student Marketplace)</option>
                    <option value="ExternalAllowed">External Students Allowed</option>
                    <option value="InstitutionOnly">Only Students from My Institution</option>
                    <option value="Private">Private / Invite-Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="Published">Publish Now (Immediate Registration)</option>
                    <option value="Draft">Save as Draft (Review Later)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Documents */}
          {currentStep === 7 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white mb-4">
                Step 7: Documents & Downloadable Attachments
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Event Brochure (PDF Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/brochure.pdf"
                    value={brochureUrl}
                    onChange={(e) => setBrochureUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rulebook / Regulation PDF Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/rulebook.pdf"
                    value={rulebookUrl}
                    onChange={(e) => setRulebookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Parental Consent Form / Schedule PDF
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/consent-form.pdf"
                    value={scheduleUrl}
                    onChange={(e) => setScheduleUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Preview & Publish */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Step 8: Final Event Preview
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review exactly how your event will appear to students before publishing.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Ready to Publish
                </span>
              </div>

              {/* Mock Student-Facing Card */}
              <div className="p-6 bg-slate-950 rounded-3xl border-2 border-blue-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                      {category}
                    </span>
                    <span className="text-xs text-blue-400 font-semibold">{sportGame}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {isPaid ? `₹${registrationFee} Entry` : "FREE Entry"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">{name || "Event Title"}</h3>
                <p className="text-xs text-slate-300">{shortDescription}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Event Date</span>
                    <strong className="text-white">{startDate}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Deadline</span>
                    <strong className="text-orange-400">{regEndDate}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Venue</span>
                    <strong className="text-white truncate block">{venueName}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Eligibility</span>
                    <strong className="text-white">Ages {minAge}–{maxAge}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl text-xs text-slate-300 border border-slate-800">
                  <strong className="text-blue-400 block mb-1">Organizer & Host:</strong>
                  {hostingInstitution} &bull; Coordinator: {contactPerson} ({contactPhone})
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePublish("Draft")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePublish("Published")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-105"
                >
                  {loading ? "Publishing..." : "Publish Event to Live Marketplace"}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
