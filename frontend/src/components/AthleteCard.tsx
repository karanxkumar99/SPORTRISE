"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Award, MapPin, Printer } from "lucide-react";

export interface AthleteCardProps {
  athlete: {
    athleteId: string;
    fullName: string;
    sport: string;
    state: string;
    district: string;
    ageCategory: string;
    gender: string;
    skillIndex: number;
    nationalRank?: number;
    stateRank?: number;
    districtRank?: number;
    isVerified?: boolean;
    createdAt?: string;
  };
  showActions?: boolean;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({ athlete, showActions = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const qrData = `SPORTRISE_ATHLETE_PASSPORT|ID:${athlete.athleteId}|NAME:${athlete.fullName}|SPORT:${athlete.sport}|STATE:${athlete.state}|DISTRICT:${athlete.district}|VERIFIED:${athlete.isVerified ? "YES" : "NO"}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Digital Athlete Identity Passport Card */}
      <div
        ref={cardRef}
        id="athlete-id-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-2 border-orange-500/40 shadow-2xl p-6 text-white transition-all hover:border-orange-500/70"
      >
        {/* Top Tricolor Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center font-black text-orange-400 text-lg shadow-inner">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-slate-100">
                  SPORTRISE
                </span>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold border border-orange-500/30">
                  खेल उत्थान
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                National Grassroots Youth Athlete Passport
              </p>
            </div>
          </div>

          {/* Verified Badge */}
          {athlete.isVerified ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>VERIFIED</span>
            </div>
          ) : (
            <div className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full font-semibold">
              PENDING
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-3 gap-4 mt-5 items-center">
          {/* Athlete Details (Left 2 cols) */}
          <div className="col-span-2 space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Athlete Name
              </span>
              <h2 className="text-xl font-black text-white tracking-wide truncate">
                {athlete.fullName}
              </h2>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Athlete ID
              </span>
              <div className="inline-block bg-slate-950/80 border border-orange-500/40 text-orange-400 font-mono font-bold text-sm px-2.5 py-1 rounded-lg tracking-wider">
                {athlete.athleteId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Sport Discipline</span>
                <span className="font-bold text-emerald-400">{athlete.sport}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                <span className="font-semibold text-slate-200">
                  {athlete.ageCategory} • {athlete.gender}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span className="truncate font-medium">
                {athlete.district}, {athlete.state}
              </span>
            </div>
          </div>

          {/* QR Code (Right col) */}
          <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-lg border border-slate-300">
            <QRCodeSVG
              value={qrData}
              size={96}
              level="M"
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
            <span className="text-[9px] font-mono text-slate-700 font-bold mt-1 tracking-tighter uppercase">
              Scan to Verify
            </span>
          </div>
        </div>

        {/* Skill Index & National / State / District Rankings */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Skill Index</span>
            <span className="text-lg font-black text-orange-400">{athlete.skillIndex}</span>
            <span className="text-[9px] text-slate-500 block">/ 1000</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">National</span>
            <span className="text-lg font-black text-amber-300 flex items-center justify-center gap-0.5">
              <Award className="w-3 h-3 text-amber-400" />#{athlete.nationalRank ?? 1}
            </span>
            <span className="text-[9px] text-slate-500 block">All-India</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">State</span>
            <span className="text-lg font-black text-emerald-400">#{athlete.stateRank ?? 1}</span>
            <span className="text-[9px] text-slate-500 block">{athlete.state.slice(0, 7)}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">District</span>
            <span className="text-lg font-black text-sky-400">#{athlete.districtRank ?? 1}</span>
            <span className="text-[9px] text-slate-500 block">{athlete.district.slice(0, 7)}</span>
          </div>
        </div>

        {/* Micro Footer */}
        <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>GOVT ALIGNED • TALENT RECOGNITION</span>
          <span>SPORTRISE.IN 🇮🇳</span>
        </div>
      </div>

      {/* Card Action Buttons */}
      {showActions && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            Print / Save Passport
          </button>
        </div>
      )}
    </div>
  );
};

export default AthleteCard;
