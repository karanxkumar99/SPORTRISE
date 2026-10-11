import React from "react";
import Link from "next/link";
import { Award, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-wider">
                SPORTRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              खेल उत्थान — Empowering India&apos;s grassroots youth sports talent by digitizing athlete profiles, providing Olympic rulebook guidance, and objective AI performance assessment.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold pt-1">
              <span>🇮🇳 Jai Hind • Khelo India Aligned</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link href="/sports-corner" className="hover:text-orange-400 transition-colors">
                  Olympic Sports & Rules Corner
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-orange-400 transition-colors">
                  National & State Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/performance-log" className="hover:text-orange-400 transition-colors">
                  AI Performance Assessment
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-orange-400 transition-colors">
                  Athlete Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Olympic Disciplines */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Tracked Sports
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-slate-400 hover:text-white">Athletics</span>
              <span className="text-slate-400 hover:text-white">Badminton</span>
              <span className="text-slate-400 hover:text-white">Boxing</span>
              <span className="text-slate-400 hover:text-white">Wrestling</span>
              <span className="text-slate-400 hover:text-white">Shooting</span>
              <span className="text-slate-400 hover:text-white">Weightlifting</span>
              <span className="text-slate-400 hover:text-white">Hockey</span>
              <span className="text-slate-400 hover:text-white">Archery</span>
              <span className="text-slate-400 hover:text-white">Swimming</span>
              <span className="text-slate-400 hover:text-white">Table Tennis</span>
            </div>
          </div>

          {/* National Coverage */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Coverage & Trust
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Active across all 28 Indian States and 8 Union Territories with verified talent registries and standardized metric benchmarks.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <span className="text-orange-400 font-semibold block mb-0.5">Grassroots Inquiries</span>
              support@sportrise.in
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} SPORTRISE (खेल उत्थान). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Indian Sports Talent
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
