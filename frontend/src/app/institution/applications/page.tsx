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

interface ApplicationData {
  id: string;
  applicationNumber: string;
  eventId: string;
  applicantName: string;
  dob?: string | null;
  age: number;
  gender: string;
  institutionName: string;
  classOrYear: string;
  courseDepartment?: string | null;
  studentIdCardNumber?: string | null;
  contactNumber: string;
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
  };
}

function InstitutionApplicationsContent() {
  const { institution } = useInstitution();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get("eventId") || "All";

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected for inspection modal
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [newStatus, setNewStatus] = useState<string>("Approved");
  const [organizerNotes, setOrganizerNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (institution) {
      fetchApplications();
    }
  }, [institution, selectedEventId, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedEventId !== "All") params.eventId = selectedEventId;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get(`/applications/institution-list`, { params });
      if (res.data?.success) {
        setApplications(res.data.applications || []);
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
      "Application ID",
      "Event Name",
      "Participant Name",
      "Age",
      "Gender",
      "Institution",
      "Class/Year",
      "Phone",
      "Email",
      "Status",
      "Team Name",
    ];

    const rows = applications.map((a) => [
      a.applicationNumber,
      `"${a.event.name}"`,
      `"${a.applicantName}"`,
      a.age,
      a.gender,
      `"${a.institutionName}"`,
      `"${a.classOrYear}"`,
      a.contactNumber,
      a.email,
      a.status,
      a.isTeam ? `"${a.teamName || ""}"` : "Individual",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sportrise-applications-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applications.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.applicationNumber.toLowerCase().includes(q) ||
      a.applicantName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.institutionName.toLowerCase().includes(q) ||
      a.event.name.toLowerCase().includes(q) ||
      (a.teamName && a.teamName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Student Applications</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review candidate rosters, verify eligibility, and approve or waitlist participants.
            </p>
          </div>

          <button
            onClick={exportCSV}
            disabled={applications.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-orange-400" />
            Export CSV Roster
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Waitlisted">Waitlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant name, ID, or school..."
              className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
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
            <h3 className="text-lg font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No registrations matching your current filters. As students submit entries, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Participant & School</th>
                  <th className="py-3.5 px-4">Tournament</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => {
                  const appliedDate = new Date(app.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
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
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {app.applicationNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white group-hover:text-orange-400 transition-colors">
                          {app.applicantName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {app.institutionName} • {app.age} Yrs
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200 truncate max-w-[180px]">
                          {app.event.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{app.event.sportGame}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {app.isTeam ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[10px] font-bold">
                            Team: {app.teamName || "Yes"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                            Individual
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{appliedDate}</td>

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
                  <span className="text-slate-400 uppercase text-[10px]">Age & Gender</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.age} Years • {selectedApp.gender}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Contact Mobile</span>
                  <p className="font-bold text-white mt-0.5">{selectedApp.contactNumber}</p>
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
