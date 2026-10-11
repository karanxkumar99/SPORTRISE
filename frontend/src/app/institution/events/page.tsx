"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Trophy,
  Plus,
  Users,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  History,
  Eye,
  Filter,
} from "lucide-react";
import api from "@/lib/api";
import { useInstitution } from "@/lib/institution-context";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";

interface InstEvent {
  id: string;
  name: string;
  category: string;
  sportGame: string;
  bannerImage?: string | null;
  startDate: string;
  endDate: string;
  regEndDate: string;
  venueName: string;
  city: string;
  status: string;
  dynamicStatus: "Upcoming" | "Ongoing" | "Completed" | "Draft";
  isRegClosed: boolean;
  applicationsCount: number;
  isPaid: boolean;
  registrationFee: number;
}

function InstitutionEventsContent() {
  const { institution, isLoading: authLoading } = useInstitution();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [events, setEvents] = useState<InstEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const f = searchParams.get("filter") || "all";
    setActiveFilter(f);
  }, [searchParams]);

  useEffect(() => {
    if (institution) {
      fetchEvents();
    }
  }, [institution, activeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/institution-events`, {
        params: { filter: activeFilter },
      });
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch institution events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete event "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data?.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      alert("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = events.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.sportGame.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.venueName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Event Management</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Organize tournaments, track registrations, and manage publication schedules.
            </p>
          </div>

          <Link
            href="/institution/events/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Events" },
              { id: "upcoming", label: "Upcoming" },
              { id: "ongoing", label: "Ongoing" },
              { id: "draft", label: "Drafts" },
              { id: "completed", label: "Past Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your events..."
              className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Event List */}
        {loading ? (
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Events Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeFilter !== "all"
                ? `You don't have any events under the "${activeFilter}" filter.`
                : "You haven't created any tournaments or competitions yet."}
            </p>
            <Link
              href="/institution/events/create"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {filtered.map((evt) => {
              const startFormatted = new Date(evt.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const endFormatted = new Date(evt.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={evt.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dynamic Status badge */}
                        {evt.status === "Draft" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
                            Draft
                          </span>
                        ) : evt.dynamicStatus === "Ongoing" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ongoing Live
                          </span>
                        ) : evt.dynamicStatus === "Upcoming" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                            Completed
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                          {evt.category}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {evt.isPaid ? `Entry: ₹${evt.registrationFee}` : "Free"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-orange-400 transition-colors">
                        <Link href={`/events/${evt.id}`}>{evt.name}</Link>
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          {startFormatted} – {endFormatted}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {evt.venueName}, {evt.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Badges & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    {/* Applications Count Button */}
                    <Link
                      href={`/institution/applications?eventId=${evt.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-200 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span>{evt.applicationsCount} Registrations</span>
                    </Link>

                    {/* View Public Page */}
                    <Link
                      href={`/events/${evt.id}`}
                      title="View Public Page"
                      className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Delete Event */}
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.name)}
                      disabled={deletingId === evt.id}
                      title="Delete Event"
                      className="p-2 rounded-xl bg-slate-850 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function InstitutionEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InstitutionEventsContent />
    </Suspense>
  );
}
