"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  School,
  User,
  Users,
  Phone,
  Mail,
  AlertCircle,
  X,
  Calendar,
  ShieldCheck,
  Check,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import api from "@/lib/api";
import { useInstitution } from "@/lib/institution-context";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";

interface TeamMember {
  name: string;
  age: string;
  studentId: string;
  gender?: string;
  roleOrPosition?: string;
}

interface EventSummary {
  id: string;
  name: string;
  sportGame: string;
  status: string;
  startDate: string;
  registeredCount: number;
}

interface ApplicationData {
  id: string;
  applicationNumber: string;
  eventId: string;
  userId?: string | null;
  athleteId?: string | null;
  applicantName: string;
  sportCategory?: string | null;
  dob?: string | null;
  age: number;
  gender: string;
  institutionName: string;
  classOrYear: string;
  courseDepartment?: string | null;
  studentIdCardNumber?: string | null;
  contactNumber: string;
  whatsappNumber?: string | null;
  email: string;
  parentName?: string | null;
  parentContact?: string | null;
  emergencyContact?: string | null;
  experience?: string | null;
  achievements?: string | null;
  idProofUrl?: string | null;
  isTeam: boolean;
  teamName?: string | null;
  captainName?: string | null;
  teamMembers?: string | null;
  status: "Submitted" | "UnderReview" | "Approved" | "Rejected" | "Waitlisted";
  organizerNotes?: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    sportGame: string;
    category: string;
    startDate: string;
    status?: string;
  };
}

function InstitutionApplicationsContent() {
  const { institution } = useInstitution();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get("eventId") || "All";

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [eventSummaries, setEventSummaries] = useState<EventSummary[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selected for inspection modal
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [newStatus, setNewStatus] = useState<string>("Approved");
  const [organizerNotes, setOrganizerNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (institution) {
      fetchApplications();
    }
  }, [institution, selectedEventId, statusFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedEventId !== "All") params.eventId = selectedEventId;
      if (statusFilter !== "All") params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const res = await api.get(`/applications/institution-list`, { params });
      if (res.data?.success) {
        setApplications(res.data.applications || []);
        setEventSummaries(res.data.eventSummaries || []);
        setTotalRegistrations(res.data.totalRegistrations || 0);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const res = await api.put(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        organizerNotes,
      });

      if (res.data?.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? { ...a, status: newStatus as ApplicationData["status"], organizerNotes }
              : a
          )
        );
        setSelectedApp({
          ...selectedApp,
          status: newStatus as ApplicationData["status"],
          organizerNotes,
        });
        alert(`Application status updated to ${newStatus}!`);
      }
    } catch (err) {
      alert("Failed to update application status.");
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      "Athlete ID",
      "Athlete Name",
      "Sport/Category",
      "Event Name",
      "Age",
      "Gender",
      "Institution",
      "Mobile Number",
      "WhatsApp Number",
      "Email",
      "Status",
      "Registration Date & Time",
    ];

    const rows = applications.map((a) => [
      `"${a.athleteId || a.applicationNumber}"`,
      `"${a.applicantName}"`,
      `"${a.sportCategory || a.event.sportGame || a.event.category}"`,
      `"${a.event.name}"`,
      a.age,
      a.gender,
      `"${a.institutionName}"`,
      `"${a.contactNumber}"`,
      `"${a.whatsappNumber || a.contactNumber}"`,
      a.email,
      a.status,
      `"${new Date(a.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sportrise-event-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applications.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.athleteId && a.athleteId.toLowerCase().includes(q)) ||
      a.applicationNumber.toLowerCase().includes(q) ||
      a.applicantName.toLowerCase().includes(q) ||
      a.contactNumber.includes(q) ||
      (a.whatsappNumber && a.whatsappNumber.includes(q)) ||
      a.email.toLowerCase().includes(q) ||
      (a.sportCategory && a.sportCategory.toLowerCase().includes(q)) ||
      a.institutionName.toLowerCase().includes(q) ||
      a.event.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">Event Registration Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {totalRegistrations} Total Registered
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time roster of registered athletes across your hosted events. View details, sort, and manage participant statuses.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchApplications()}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={applications.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-orange-400" />
              Export CSV Roster
            </button>
          </div>
        </div>

        {/* Filters, Event Selector & Search Bar */}
        <div className="mt-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Event Selector with Registration Counts */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 max-w-[280px]"
            >
              <option value="All">All Events ({totalRegistrations} Registered Athletes)</option>
              {eventSummaries.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} — ({evt.registeredCount} registered)
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Waitlisted">Waitlisted</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="createdAt">Sort: Registration Date</option>
              <option value="applicantName">Sort: Athlete Name</option>
              <option value="athleteId">Sort: Athlete ID</option>
              <option value="status">Sort: Status</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Switch to ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              className="px-3 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Athlete ID, name, mobile, or sport..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table of Applications */}
        {loading ? (
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Registrations Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No athlete registrations matching your current filters. When athletes register for your events, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Athlete ID</th>
                  <th className="py-3.5 px-4">Athlete Name</th>
                  <th className="py-3.5 px-4">Sport / Category</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">WhatsApp Number</th>
                  <th className="py-3.5 px-4">Registration Date & Time</th>
                  <th className="py-3.5 px-4">Registration Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => {
                  const appliedTimestamp = new Date(app.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        setNewStatus(app.status);
                        setOrganizerNotes(app.organizerNotes || "");
                      }}
                    >
                      {/* Athlete ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {app.athleteId || app.applicationNumber}
                      </td>

                      {/* Athlete Name */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {app.applicantName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {app.institutionName} &bull; {app.age} Yrs
                        </p>
                      </td>

                      {/* Sport / Category */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200 truncate max-w-[180px]">
                          {app.sportCategory || app.event.sportGame || app.event.category}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{app.event.name}</p>
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {app.contactNumber}
                      </td>

                      {/* WhatsApp Number */}
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        {app.whatsappNumber || app.contactNumber || "—"}
                      </td>

                      {/* Registration Date & Time */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {appliedTimestamp}
                      </td>

                      {/* Registration Status */}
                      <td className="py-3.5 px-4">
                        {app.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Approved
                          </span>
                        ) : app.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                            Rejected
                          </span>
                        ) : app.status === "Waitlisted" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            Waitlisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {app.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                            setNewStatus(app.status);
                            setOrganizerNotes(app.organizerNotes || "");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Full Application Review & Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-slate-950 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-orange-400">
                    {selectedApp.applicationNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">
                    {selectedApp.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedApp.applicantName}
                </h2>
                <p className="text-xs text-slate-400">
                  Applied for <strong className="text-slate-200">{selectedApp.event.name}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Participant Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Athlete ID</span>
                  <p className="font-bold text-orange-400 font-mono mt-0.5">{selectedApp.athleteId || selectedApp.applicationNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Sport / Category</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.sportCategory || selectedApp.event.sportGame || selectedApp.event.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Age & Gender</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.age} Years • {selectedApp.gender}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Mobile Number</span>
                  <p className="font-bold text-white font-mono mt-0.5">{selectedApp.contactNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">WhatsApp Number</span>
                  <p className="font-bold text-emerald-400 font-mono mt-0.5">{selectedApp.whatsappNumber || selectedApp.contactNumber || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Email</span>
                  <p className="font-bold text-white mt-0.5 truncate">{selectedApp.email}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 uppercase text-[10px]">School / College</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.institutionName}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Class / Year</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.classOrYear || "N/A"}</p>
                </div>
              </div>

              {/* Parent & Emergency Info */}
              {(selectedApp.parentName || selectedApp.emergencyContact) && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Parent / Guardian Information</p>
                  <p className="text-slate-300">
                    Parent: <strong>{selectedApp.parentName || "N/A"}</strong> ({selectedApp.parentContact || "No contact"})
                  </p>
                  {selectedApp.emergencyContact && (
                    <p className="text-slate-300">
                      Emergency: <strong>{selectedApp.emergencyContact}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Team Information if Team */}
              {selectedApp.isTeam && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                  <p className="text-[10px] font-bold uppercase text-purple-400">Team Details</p>
                  <p className="text-white font-bold">Team: {selectedApp.teamName || "N/A"}</p>
                  <p className="text-slate-300">Captain: {selectedApp.captainName || selectedApp.applicantName}</p>
                  {selectedApp.teamMembers && (
                    <div className="mt-2 text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {selectedApp.teamMembers}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements & Proof */}
              {selectedApp.experience && (
                <div className="text-xs">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Past Sports Experience</span>
                  <p className="text-slate-300 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedApp.experience}
                  </p>
                </div>
              )}

              {selectedApp.idProofUrl && (
                <div className="text-xs">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Attached Document Link</span>
                  <a
                    href={selectedApp.idProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-orange-400 underline truncate bg-slate-950 p-3 rounded-xl border border-slate-800"
                  >
                    {selectedApp.idProofUrl}
                  </a>
                </div>
              )}

              {/* Organizer Status Update Action Box */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Decision & Organizer Feedback
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="UnderReview">Under Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Organizer Notes / Instructions</label>
                    <input
                      type="text"
                      value={organizerNotes}
                      onChange={(e) => setOrganizerNotes(e.target.value)}
                      placeholder="e.g. Reporting at 8:00 AM sharp, bring original Aadhaar..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleUpdateStatus}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Status & Notify Student"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstitutionApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InstitutionApplicationsContent />
    </Suspense>
  );
}
