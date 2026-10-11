"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  ExternalLink,
  Check,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { useInstitution } from "@/lib/institution-context";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function InstitutionNotificationsPage() {
  const { institution } = useInstitution();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (institution) {
      fetchNotifications();
    }
  }, [institution]);

  const fetchNotifications = async () => {
    if (!institution?.id) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications", {
        params: { institutionId: institution.id },
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Notifications</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live updates on student registrations, publication alerts, and administration feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {notifications.filter((n) => !n.isRead).length} Unread
            </span>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-12 text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You do not have any new notifications at the moment. When students apply for your events, updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {notifications.map((item) => {
              const timeFormatted = new Date(item.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    item.isRead
                      ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
                      : "bg-slate-900 border-slate-700/80 text-slate-200 shadow-md"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.type === "success"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.type === "alert"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-orange-500/15 text-orange-400"
                    }`}
                  >
                    {item.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>

                    <div className="pt-2 flex items-center gap-3">
                      {item.link && (
                        <Link
                          href={item.link}
                          className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
                        >
                          <span>View Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {!item.isRead && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
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
