"use client";

import React, { useMemo } from "react";
import { ALL_INDIAN_STATES, INDIAN_STATES_AND_UT } from "../data/india-locations";
import { MapPin, Navigation } from "lucide-react";

interface StateDistrictSelectorProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  errorState?: string;
  errorDistrict?: string;
  disabled?: boolean;
  className?: string;
}

export const StateDistrictSelector: React.FC<StateDistrictSelectorProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  errorState,
  errorDistrict,
  disabled = false,
  className = "",
}) => {
  // Available districts for chosen state
  const availableDistricts = useMemo(() => {
    if (!selectedState || !INDIAN_STATES_AND_UT[selectedState]) {
      return [];
    }
    return INDIAN_STATES_AND_UT[selectedState];
  }, [selectedState]);

  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    onStateChange(newState);
    // Reset district when state changes
    onDistrictChange("");
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* State / UT Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange-500" />
          State / Union Territory <span className="text-orange-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={handleStateSelect}
            disabled={disabled}
            className={`w-full bg-slate-900/90 border ${
              errorState ? "border-red-500" : "border-slate-700 focus:border-orange-500"
            } text-slate-100 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer disabled:opacity-50`}
          >
            <option value="" disabled className="text-slate-500">
              Select State / UT (36 States & UTs)
            </option>
            {ALL_INDIAN_STATES.map((state) => (
              <option key={state} value={state} className="bg-slate-900 text-slate-100">
                {state}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>
        {errorState && <p className="mt-1 text-xs text-red-400">{errorState}</p>}
      </div>

      {/* District Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-emerald-500" />
          District <span className="text-orange-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={disabled || !selectedState}
            className={`w-full bg-slate-900/90 border ${
              errorDistrict ? "border-red-500" : "border-slate-700 focus:border-emerald-500"
            } text-slate-100 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="" disabled className="text-slate-500">
              {selectedState ? `Select District (${availableDistricts.length} available)` : "First choose a state"}
            </option>
            {availableDistricts.map((district) => (
              <option key={district} value={district} className="bg-slate-900 text-slate-100">
                {district}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>
        {errorDistrict && <p className="mt-1 text-xs text-red-400">{errorDistrict}</p>}
      </div>
    </div>
  );
};

export default StateDistrictSelector;
