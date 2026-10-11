"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "../../../../lib/institution-context";
import api from "../../../../lib/api";
import { ALL_INDIAN_STATES } from "../../../../data/india-locations";
import { getCurrentGPSCoordinates, reverseGeocodeCoordinates } from "@/lib/location-utils";
import {
  School,
  Building2,
  Mail,
  Phone,
  Lock,
  Globe,
  MapPin,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LocateFixed,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function InstitutionRegisterPage() {
  const router = useRouter();
  const { login } = useInstitution();

  const [name, setName] = useState("");
  const [type, setType] = useState("College");
  const [logo, setLogo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Delhi (NCT)");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  const [authorizedPersonName, setAuthorizedPersonName] = useState("");
  const [authorizedPersonContact, setAuthorizedPersonContact] = useState("");
  const [description, setDescription] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [coordinatorPhone, setCoordinatorPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    setLocationErrorMsg(null);
    setLocationSuccessMsg(null);

    try {
      const coords = await getCurrentGPSCoordinates();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);

      const geocoded = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      if (geocoded.address) setAddress(geocoded.address);
      if (geocoded.city) setCity(geocoded.city);
      if (geocoded.state) setState(geocoded.state);
      if (geocoded.pincode) setPincode(geocoded.pincode);

      setLocationSuccessMsg(
        `Detected: ${geocoded.formattedAddress || `${geocoded.city}, ${geocoded.state}`}`
      );
    } catch (err: unknown) {
      const errorObj = err as Error;
      setLocationErrorMsg(errorObj.message || "Failed to fetch GPS location.");
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        type,
        logo: logo || undefined,
        email,
        password,
        contactNumber,
        website: website || undefined,
        address,
        city,
        state,
        country,
        pincode,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        authorizedPersonName,
        authorizedPersonContact,
        description: description || undefined,
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
      };

      const res = await api.post("/institutions/register", payload);

      if (res.data?.success) {
        login(res.data.token, res.data.institution);
        router.push("/institution/dashboard");
      } else {
        setError(res.data?.message || "Registration failed.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            School & College Portal Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Publish sports tournaments, academic olympiads, and cultural events for students across India.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Institution Details */}
          <div>
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 1. Institution Identity & Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's Senior Secondary School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Type <span className="text-orange-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="School">School (K-12)</option>
                  <option value="College">College (Degree / Autonomous)</option>
                  <option value="University">University (State / Central / Deemed)</option>
                  <option value="Institute">Institute (Sports Academy / Polytechnic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Institution Email <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sports@institution.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Contact Number <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 11 2345 6789"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://institution.edu.in"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institution Description / Background
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe your institution's sports facilities, accreditation, and legacy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> 2. Complete Campus Location
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Athletes and scouts use this address for event venue reporting and GPS directions.
                </p>
              </div>

              {/* Fetch Location Action Button */}
              <button
                type="button"
                onClick={handleFetchCurrentLocation}
                disabled={fetchingLocation}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50 flex-shrink-0"
              >
                {fetchingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching GPS Location...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-4 h-4" />
                    <span>Fetch Location (Auto-Fill)</span>
                  </>
                )}
              </button>
            </div>

            {/* Location Success Feedback Banner */}
            {locationSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-emerald-300">Campus Location Auto-Detected & Populated!</p>
                  <p className="text-[11px] text-emerald-400/90 leading-relaxed">{locationSuccessMsg}</p>
                  {latitude && longitude && (
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px]">
                      <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        GPS: {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-300 underline font-bold flex items-center gap-1 hover:text-white"
                      >
                        Verify Pin on Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Error Feedback Banner */}
            {locationErrorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Manual Entry Available</p>
                  <p className="text-[11px] text-amber-400/90">{locationErrorMsg}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campus Address <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sector, Street, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  State / UT <span className="text-orange-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PIN / ZIP Code <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 110022"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value={country}
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Authorized Person & Event Coordinator */}
          <div className="pt-4 border-t border-slate-800">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> 3. Leadership & Event Coordinator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Principal / Director Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Person Contact <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={authorizedPersonContact}
                  onChange={(e) => setAuthorizedPersonContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sports/Event Coordinator Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Virender Singh"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coordinator Phone Number <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 22233"
                  value={coordinatorPhone}
                  onChange={(e) => setCoordinatorPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coordinator Official Email <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="coordinator@institution.edu.in"
                  value={coordinatorEmail}
                  onChange={(e) => setCoordinatorEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security Password */}
          <div className="pt-4 border-t border-slate-800">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> 4. Portal Access Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Password <span className="text-orange-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-orange-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering Institution...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Complete Registration & Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an institution portal account?{" "}
          <Link href="/institution/login" className="font-bold text-blue-400 hover:text-blue-300">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
