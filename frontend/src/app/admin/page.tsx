"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

interface AdminStats {
  totalInstitutions: number;
  verifiedInstitutions: number;
  totalEvents: number;
  publishedEvents: number;
  totalApplications: number;
}

interface AdminInstitution {
  id: string;
  name: string;
  type: string;
  email: string;
  city: string;
  state: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    events: number;
  };
}

interface AdminEvent {
  id: string;
  name: string;
  category: string;
  sportGame: string;
  status: string;
  venueName: string;
  city: string;
  createdAt: string;
  institution: {
    name: string;
    type: string;
    isVerified: boolean;
  };
  _count: {
    applications: number;
  };
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/overview");
      if (res.data?.success) {
        setStats(res.data.stats);
        setInstitutions(res.data.institutions || []);
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (id: string) => {
    setActionLoading(`inst-${id}`);
    try {
      const res = await api.put(`/admin/institution/${id}/verify`);
      if (res.data?.success) {
        setInstitutions((prev) =>
          prev.map((inst) =>
            inst.id === id ? { ...inst, isVerified: res.data.institution.isVerified } : inst
          )
        );
      }
    } catch (err) {
      alert("Failed to toggle verification.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateEvent = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    setActionLoading(`evt-${id}`);
    try {
      const res = await api.put(`/admin/event/${id}/moderate`, { status: nextStatus });
      if (res.data?.success) {
        setEvents((prev) =>
          prev.map((evt) => (evt.id === id ? { ...evt, status: nextStatus } : evt))
        );
      }
    } catch (err) {
      alert("Failed to moderate event.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Super-Admin Control Room
            </div>
            <h1 className="text-3xl font-black text-white">Platform Oversight & Moderation</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify participating educational institutions, audit tournaments, and review platform metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
            <Link
              href="/events"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Institutions</span>
              <p className="text-2xl font-black text-white mt-1">{stats.totalInstitutions}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Hosts</span>
              <p className="text-2xl font-black text-sky-400 mt-1">{stats.verifiedInstitutions}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Events</span>
              <p className="text-2xl font-black text-white mt-1">{stats.totalEvents}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Published Tournaments</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.publishedEvents}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Student Applications</span>
              <p className="text-2xl font-black text-orange-400 mt-1">{stats.totalApplications}</p>
            </div>
          </div>
        )}

        {/* Section: Institution Accreditation Management */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                Registered Educational Institutions
              </h2>
              <p className="text-xs text-slate-400">
                Grant or revoke official &ldquo;Institution Verified&rdquo; badge visible to student athletes.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-bold">{institutions.length} Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Institution Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Events Created</th>
                  <th className="py-3 px-3">Badge Status</th>
                  <th className="py-3 px-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{inst.name}</p>
                      <p className="text-[10px] text-slate-400">{inst.email}</p>
                    </td>
                    <td className="py-3 px-3">{inst.type}</td>
                    <td className="py-3 px-3">{inst.city}, {inst.state}</td>
                    <td className="py-3 px-3 font-bold text-orange-400">{inst._count.events}</td>
                    <td className="py-3 px-3">
                      {inst.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleVerification(inst.id)}
                        disabled={actionLoading === `inst-${inst.id}`}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          inst.isVerified
                            ? "bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                            : "bg-sky-500 hover:bg-sky-600 text-white shadow"
                        }`}
                      >
                        {actionLoading === `inst-${inst.id}`
                          ? "Saving..."
                          : inst.isVerified
                          ? "Revoke Badge"
                          : "Verify Institution"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Tournament Moderation */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Tournaments & Events Moderation
              </h2>
              <p className="text-xs text-slate-400">
                Audit event guidelines, suspend inappropriate listings, or unpublish drafts.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-bold">{events.length} Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Tournament Name</th>
                  <th className="py-3 px-3">Organizer / Institution</th>
                  <th className="py-3 px-3">Sport & Category</th>
                  <th className="py-3 px-3">Applications</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{evt.name}</p>
                      <p className="text-[10px] text-slate-400">{evt.venueName}, {evt.city}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300">
                      {evt.institution.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-orange-400 font-bold">{evt.sportGame}</span> ({evt.category})
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{evt._count.applications}</td>
                    <td className="py-3 px-3">
                      {evt.status === "Published" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                          Draft / Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/events/${evt.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300"
                          title="Preview Event"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleModerateEvent(evt.id, evt.status)}
                          disabled={actionLoading === `evt-${evt.id}`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            evt.status === "Published"
                              ? "bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                          }`}
                        >
                          {actionLoading === `evt-${evt.id}`
                            ? "Saving..."
                            : evt.status === "Published"
                            ? "Suspend to Draft"
                            : "Publish Event"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
