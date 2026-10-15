"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  User,
  Plus,
  Trash2,
  FileText,
  School,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface EventInfo {
  id: string;
  name: string;
  category: string;
  sportGame: string;
  hostingInstitution: string;
  participationType: string;
  teamMinSize?: number | null;
  teamMaxSize?: number | null;
  isPaid: boolean;
  registrationFee: number;
}

interface TeamMember {
  name: string;
  age: string;
  gender: string;
  studentId: string;
  roleOrPosition?: string;
}

interface EventApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventInfo;
  onSuccess?: (appNumber: string) => void;
}

export const EventApplicationModal: React.FC<EventApplicationModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Athlete ID Fast Registration & Lookup State
  const [athleteId, setAthleteId] = useState("");
  const [isFetchingAthlete, setIsFetchingAthlete] = useState(false);
  const [athleteLookupError, setAthleteLookupError] = useState<string | null>(null);
  const [athleteFound, setAthleteFound] = useState(false);
  const [sportCategory, setSportCategory] = useState(event.sportGame || event.category || "");

  // Form State
  const [applicantName, setApplicantName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [institutionName, setInstitutionName] = useState("");
  const [classOrYear, setClassOrYear] = useState("");
  const [courseDepartment, setCourseDepartment] = useState("");
  const [studentIdCardNumber, setStudentIdCardNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState("");
  const [idProofUrl, setIdProofUrl] = useState("");

  // Team state
  const isTeamEvent = event.participationType?.toLowerCase().includes("team");
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", age: "", gender: "Male", studentId: "", roleOrPosition: "" },
  ]);

  // Pre-populate with logged in user data if available
  useEffect(() => {
    if (user) {
      if (!athleteId && user.athleteId) setAthleteId(user.athleteId);
      if (!applicantName) setApplicantName(user.fullName || "");
      if (!email) setEmail(user.email || "");
      if (!contactNumber) {
        setContactNumber(user.mobile || "");
        setWhatsappNumber(user.mobile || "");
      }
      if (!gender && user.gender) setGender(user.gender);
      if (isTeamEvent && !captainName) setCaptainName(user.fullName || "");
      if (!sportCategory && user.sport) setSportCategory(user.sport);
    }
  }, [user, isTeamEvent]);

  // Lookup Athlete by ID
  const handleLookupAthlete = async () => {
    if (!athleteId.trim()) {
      setAthleteLookupError("Please enter your Athlete ID (e.g. SR-IND-26-ATH-10921).");
      return;
    }

    setIsFetchingAthlete(true);
    setAthleteLookupError(null);
    try {
      const res = await api.get(`/applications/lookup-athlete/${encodeURIComponent(athleteId.trim())}`);
      if (res.data?.success && res.data.athlete) {
        const a = res.data.athlete;
        setApplicantName(a.applicantName || "");
        setEmail(a.email || "");
        setContactNumber(a.contactNumber || "");
        setWhatsappNumber(a.whatsappNumber || a.contactNumber || "");
        if (a.gender) setGender(a.gender);
        if (a.dob) setDob(a.dob);
        if (a.age) setAge(a.age.toString());
        if (a.institutionName) setInstitutionName(a.institutionName);
        if (a.sportCategory) setSportCategory(a.sportCategory);
        if (a.achievements) setAchievements(a.achievements);
        setAthleteFound(true);
      } else {
        setAthleteLookupError(res.data?.message || "Invalid Athlete ID. Please enter a valid Athlete ID registered on SportRise.");
        setAthleteFound(false);
      }
    } catch (err: any) {
      setAthleteLookupError(
        err.response?.data?.message ||
        `No athlete found with Athlete ID "${athleteId.trim()}". Please verify your Athlete ID or register as an athlete first.`
      );
      setAthleteFound(false);
    } finally {
      setIsFetchingAthlete(false);
    }
  };

  // Auto calculate age from dob
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 5 && calculatedAge <= 60) {
        setAge(calculatedAge.toString());
      }
    }
  };

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: "", age: "", gender: "Male", studentId: "", roleOrPosition: "" },
    ]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, idx) => idx !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, val: string) => {
    const updated = [...teamMembers];
    updated[index][field] = val;
    setTeamMembers(updated);
  };

  const handleCopyId = () => {
    if (submittedAppNumber) {
      navigator.clipboard.writeText(submittedAppNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        eventId: event.id,
        userId: user?.id || null,
        athleteId: athleteId.trim() || null,
        applicantName,
        sportCategory: sportCategory || event.sportGame || event.category,
        dob: dob || null,
        age: parseInt(age, 10),
        gender,
        institutionName,
        classOrYear,
        courseDepartment: courseDepartment || null,
        studentIdCardNumber: studentIdCardNumber || null,
        contactNumber,
        whatsappNumber: whatsappNumber || contactNumber,
        email,
        parentName: parentName || null,
        parentContact: parentContact || null,
        emergencyContact: emergencyContact || null,
        experience: experience || null,
        achievements: achievements || null,
        idProofUrl: idProofUrl || null,
        isTeam: isTeamEvent,
        teamName: isTeamEvent ? teamName : null,
        captainName: isTeamEvent ? (captainName || applicantName) : null,
        teamMembers: isTeamEvent ? teamMembers.filter((m) => m.name.trim() !== "") : null,
      };

      const res = await api.post("/applications/apply", payload);

      if (res.data?.success) {
        const appNum = res.data.applicationNumber;
        setSubmittedAppNumber(appNum);
        if (onSuccess) onSuccess(appNum);
      } else {
        setError(res.data?.message || "Failed to submit application.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to submit application. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-950/80 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Official Registration Form
              </span>
              {event.isPaid ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                  Fee: ₹{event.registrationFee}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  Free Registration
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Apply for {event.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Organized by <span className="text-slate-200 font-bold">{event.hostingInstitution}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {submittedAppNumber ? (
            /* Success confirmation screen */
            <div className="py-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              {/* Exact Required Success Message */}
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Your response has been submitted successfully!
              </h3>
              
              {/* Exact Required Athlete Notification Message */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-semibold leading-relaxed shadow-lg text-left space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Your response has been submitted successfully!</span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-emerald-500/20 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>We will notify you about important event information through your mobile number and WhatsApp.</span>
                </div>
              </div>

              {/* Unique Application ID Box */}
              <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Official Application ID / Reference No.
                  </p>
                  <p className="text-xl font-mono font-black text-orange-400 mt-0.5">
                    {submittedAppNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Please preserve this Application ID for reporting at the venue and future verification. You will also receive real-time status updates in your dashboard.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="/events/my-applications"
                  className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm text-center shadow-lg transition-all"
                >
                  Track in My Applications
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Athlete ID Fast Registration & Auto-fill Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Register through Athlete ID (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Retrieves your details and auto-fills the form
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={athleteId}
                    onChange={(e) => {
                      setAthleteId(e.target.value);
                      if (athleteLookupError) setAthleteLookupError(null);
                    }}
                    placeholder="e.g. SR-IND-26-ATH-10921"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleLookupAthlete}
                    disabled={isFetchingAthlete || !athleteId.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {isFetchingAthlete ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch Details"
                    )}
                  </button>
                </div>
                {athleteLookupError && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{athleteLookupError}</span>
                  </div>
                )}
                {athleteFound && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Athlete details retrieved successfully! You can review or complete any missing fields below.</span>
                  </div>
                )}
              </div>

              {/* Section 1: Participant Identity */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  Participant Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Karan Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={handleDobChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Age (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={60}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 17"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: School / College Details */}
              <div className="border-t border-slate-800/80 pt-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <School className="w-4 h-4 text-emerald-400" />
                  Educational Affiliation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      School / College / Institute Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Delhi Public School, R.K. Puram"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Class / Grade / College Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={classOrYear}
                      onChange={(e) => setClassOrYear(e.target.value)}
                      placeholder="e.g. Class 11 / 2nd Year"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Student Roll / ID Card Number
                    </label>
                    <input
                      type="text"
                      value={studentIdCardNumber}
                      onChange={(e) => setStudentIdCardNumber(e.target.value)}
                      placeholder="e.g. DPS-2024-8841"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Course / Department (if college)
                    </label>
                    <input
                      type="text"
                      value={courseDepartment}
                      onChange={(e) => setCourseDepartment(e.target.value)}
                      placeholder="e.g. B.Sc Physical Education"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Emergency */}
              <div className="border-t border-slate-800/80 pt-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400" />
                  Contact & Parent/Guardian Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value);
                        if (!whatsappNumber) setWhatsappNumber(e.target.value);
                      }}
                      placeholder="e.g. 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp Number (for event updates)
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. XXXXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Team Registration (if applicable) */}
              {isTeamEvent && (
                <div className="border-t border-slate-800/80 pt-5 bg-slate-950/50 p-4 rounded-2xl border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Team Roster ({event.participationType})
                    </h3>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="px-2.5 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 flex items-center gap-1 hover:bg-purple-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Player
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        required={isTeamEvent}
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Delhi Strikers XI"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Captain Name
                      </label>
                      <input
                        type="text"
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        placeholder="e.g. Same as Applicant"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-semibold">Additional Team Players:</p>
                    {teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(idx, "name", e.target.value)}
                            placeholder={`Player #${idx + 2} Name`}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={member.age}
                            onChange={(e) => updateTeamMember(idx, "age", e.target.value)}
                            placeholder="Age"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={member.studentId}
                            onChange={(e) => updateTeamMember(idx, "studentId", e.target.value)}
                            placeholder="Roll/ID"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                          {teamMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTeamMember(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Sports Experience & Achievements */}
              <div className="border-t border-slate-800/80 pt-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Sports Experience & Achievements
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Past Participation / Tournament Experience (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. Zonal athletics runner-up (2025), School football team striker for 3 years..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ID Proof / School ID Card Document Link (Google Drive / Cloud storage)
                    </label>
                    <input
                      type="url"
                      value={idProofUrl}
                      onChange={(e) => setIdProofUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Optional: Organizers may verify school affiliation during spot reporting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="border-t border-slate-800/80 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500 bg-slate-950"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I hereby declare that all details entered above are true to the best of my knowledge. I agree to abide by all event rules, reporting times, code of conduct, and disciplinary policies set by <strong className="text-slate-300">{event.hostingInstitution}</strong>.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Entry...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventApplicationModal;
