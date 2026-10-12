"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useInstitution } from "../lib/institution-context";
import {
  Trophy,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Flame,
  Award,
  Calendar,
  School,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { institution } = useInstitution();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Flame },
    { href: "/sports-corner", label: "Sports Corner", icon: BookOpen },
    { href: "/events", label: "Events", icon: Calendar, badge: "New" },
    { href: "/matches", label: "Matches", icon: ShieldCheck },
    { href: "/leaderboard", label: "Rankings", icon: Trophy },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: User }] : []),
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      {/* Top Tiranga Micro Bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  SPORTRISE
                </span>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold border border-orange-500/30">
                  खेल उत्थान
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
                Grassroots Youth Sports Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold border border-orange-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth CTA & Institution Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Institution Portal Link */}
            {institution ? (
              <Link
                href="/institution/dashboard"
                prefetch={true}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all shadow-sm"
              >
                <School className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[120px]">{institution.name}</span>
              </Link>
            ) : (
              <Link
                href="/institution/login"
                prefetch={true}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                <School className="w-3.5 h-3.5 text-blue-400" />
                <span>Institution Portal</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                    {user.fullName.slice(0, 1)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-200 leading-none truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-orange-400 font-mono mt-0.5 leading-none">
                      {user.athleteId}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  prefetch={true}
                  className="px-4 py-2 text-sm font-bold text-slate-200 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                >
                  Register Athlete
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-semibold ${
                  active
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          {/* Mobile Institution Portal Link */}
          <div className="pt-2">
            <Link
              href={institution ? "/institution/dashboard" : "/institution/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-semibold bg-blue-600/10 text-blue-300 border border-blue-500/20"
            >
              <School className="w-5 h-5 text-blue-400" />
              <span>{institution ? `Portal: ${institution.name}` : "Institution Portal"}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-850 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="font-bold text-white">{user.fullName}</p>
                  <p className="text-xs text-orange-400 font-mono">{user.athleteId}</p>
                  <p className="text-xs text-slate-400">{user.sport} • {user.state}</p>
                </div>
                <Link
                  href="/events/my-applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20"
                >
                  Track My Applications
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-slate-200 bg-slate-900 rounded-xl border border-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg"
                >
                  Register Athlete
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
