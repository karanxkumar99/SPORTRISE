"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInstitution } from "../../lib/institution-context";
import {
  LayoutDashboard,
  Building2,
  CalendarPlus,
  CalendarCheck,
  FileEdit,
  History,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export const InstitutionSidebar: React.FC = () => {
  const pathname = usePathname();
  const { institution, logout } = useInstitution();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/institution/dashboard", icon: LayoutDashboard },
    { label: "Institution Profile", href: "/institution/profile", icon: Building2 },
    { label: "Create Event", href: "/institution/events/create", icon: CalendarPlus, highlight: true },
    { label: "Upcoming & Ongoing", href: "/institution/events?filter=upcoming", icon: CalendarCheck },
    { label: "Draft Events", href: "/institution/events?filter=draft", icon: FileEdit },
    { label: "Past Events", href: "/institution/events?filter=completed", icon: History },
    { label: "Applications", href: "/institution/applications", icon: FileText },
    { label: "Registered Students", href: "/institution/applications?tab=students", icon: Users },
    { label: "Notifications", href: "/institution/notifications", icon: Bell },
    { label: "Settings", href: "/institution/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href.includes("?") && pathname === href.split("?")[0]);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {institution?.name?.slice(0, 1) || "I"}
          </div>
          <span className="font-bold text-sm text-white truncate max-w-[200px]">
            {institution?.name || "Institution Portal"}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900/95 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between`}
      >
        <div className="space-y-6">
          {/* Institution Header Badge */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">
                {institution?.name?.slice(0, 1) || "I"}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white truncate max-w-[130px]">
                    {institution?.name || "Institution"}
                  </h3>
                  {institution?.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
                  {institution?.type || "School/College"}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {institution?.city}, {institution?.state}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <Link
                href="/events"
                target="_blank"
                className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <span>Live Marketplace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                Active Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : item.highlight
                      ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Bottom CTA */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Institution</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default InstitutionSidebar;
