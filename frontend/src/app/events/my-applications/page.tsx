"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Trophy,
  School,
  ArrowRight,
  Printer,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ApplicationItem {
  id: string;
  applicationNumber: string;
  applicantName: string;
  age: number;
  gender: string;
  institutionName: string;
  classOrYear: string;
  contactNumber: string;
  email: string;
  isTeam: boolean;
  teamName?: string | null;
  status: "Submitted" | "UnderReview" | "Approved" | "Rejected" | "Waitlisted";
  organizerNotes?: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    category: string;
    sportGame: string;
    bannerImage?: string | null;
    startDate: string;
    endDate: string;
    venueName: string;
    city: string;
    hostingInstitution: string;
  };
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [lookupQuery, setLookupQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setSearchEmail(user.email);
      fetchApplications(user.email, user.id);
    } else {
      // Check if user saved email in local storage or prompt email search
      const savedEmail = localStorage.getItem("sportrise_student_email");
      if (savedEmail) {
        setSearchEmail(savedEmail);
        fetchApplications(savedEmail);
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchApplications = async (emailVal: string, userIdVal?: string) => {
    if (!emailVal && !userIdVal) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (userIdVal) params.userId = userIdVal;
      if (emailVal) params.email = emailVal;

      const res = await api.get("/applications/my-applications", { params });
      if (res.data?.success) {
        setApplications(res.data.applications || []);
        if (emailVal) {
          localStorage.setItem("sportrise_student_email", emailVal);
        }
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      fetchApplications(searchEmail.trim(), user?.id);
    }
  };

  const handleCopy = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case "Waitlisted":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Clock className="w-3.5 h-3.5" />
            Waitlisted
          </span>
        );
      case "UnderReview":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Submitted
          </span>
        );
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!lookupQuery.trim()) return true;
    const q = lookupQuery.toLowerCase();
    return (
      app.applicationNumber.toLowerCase().includes(q) ||
      app.event.name.toLowerCase().includes(q) ||
      app.applicantName.toLowerCase().includes(q) ||
      (app.teamName && app.teamName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                Student Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                My Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Applications</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Track status, review verification notes from tournament organizers, and print your athlete entry passes.
              </p>
            </div>

            <Link
              href="/events"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
            >
              <Trophy className="w-4 h-4" />
              Browse More Events
            </Link>
          </div>

          {/* Search by Email lookup if not logged in or switching */}
          <form
            onSubmit={handleLookupSubmit}
            className="mt-6 flex flex-col sm:flex-row items-center gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-xl"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter your registered email address..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors whitespace-nowrap"
            >
              Lookup Applications
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* In-page filter search if there are applications */}
        {applications.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Filter by App ID or tournament name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <p className="text-xs text-slate-400">
              Found <strong className="text-white">{filteredApplications.length}</strong> submitted application(s)
            </p>
          </div>
        )}

        {/* List of Applications */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : !searchEmail && applications.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Enter Your Email to Track Applications</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Please enter the email address you used when applying for events to view real-time status and entry passes.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No tournament applications found for <strong className="text-slate-300">{searchEmail}</strong>. If you recently applied, confirm the email entered.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg hover:bg-orange-600 transition-colors"
            >
              Explore Available Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const submissionDate = new Date(app.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const eventStartDate = new Date(app.event.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={app.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        {/* Unique Application ID */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">App ID:</span>
                          <span className="font-mono text-xs font-black text-orange-400">
                            {app.applicationNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(app.applicationNumber)}
                            title="Copy Application Number"
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedId === app.applicationNumber && (
                            <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                          )}
                        </div>

                        {/* Status Badge */}
                        {getStatusBadge(app.status)}

                        <span className="text-xs text-slate-500">Submitted on {submissionDate}</span>
                      </div>

                      <h3 className="text-xl font-black text-white hover:text-orange-400 transition-colors">
                        <Link href={`/events/${app.event.id}`}>{app.event.name}</Link>
                      </h3>

                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.event.hostingInstitution}</span>
                        <span>•</span>
                        <span className="text-orange-400 font-bold">{app.event.sportGame}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${app.event.id}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <span>View Event</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Pass</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Participant</p>
                      <p className="text-white font-bold mt-0.5">{app.applicantName} ({app.age} Yrs, {app.gender})</p>
                      <p className="text-slate-400 text-[11px] truncate">{app.institutionName}</p>
                      {app.isTeam && app.teamName && (
                        <p className="text-purple-400 font-bold text-[11px] mt-0.5">Team: {app.teamName}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Event Date & Venue</p>
                      <p className="text-white font-bold mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-orange-400" />
                        Starts: {eventStartDate}
                      </p>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {app.event.venueName}, {app.event.city}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Organizer Status & Notes</p>
                      {app.organizerNotes ? (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 mt-1">
                          <strong>Note:</strong> {app.organizerNotes}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {app.status === "Approved"
                            ? "Your application is officially accepted. Carry your School ID card at the venue."
                            : app.status === "Rejected"
                            ? "Application declined. You can reach out to the coordinator for details."
                            : "Your application is currently being reviewed by the institution committee."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
