"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  School,
  ExternalLink,
  LocateFixed,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useInstitution } from "@/lib/institution-context";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";
import { getCurrentGPSCoordinates, reverseGeocodeCoordinates } from "@/lib/location-utils";

export default function InstitutionProfilePage() {
  const { institution, refreshProfile } = useInstitution();

  const [name, setName] = useState("");
  const [type, setType] = useState("School");
  const [logo, setLogo] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
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
  const [supportedSports, setSupportedSports] = useState("");
  const [facilities, setFacilities] = useState("");
  const [coaches, setCoaches] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLogoError("File size exceeds 5MB limit. Please select a smaller logo file.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setLogoError("Unsupported image format. Allowed formats: JPG, PNG, WEBP, GIF.");
      return;
    }

    setUploadingLogo(true);
    setLogoError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data.file?.url) {
        setLogo(res.data.file.url);
      } else {
        setLogoError(res.data?.message || "Logo upload failed.");
      }
    } catch (err: any) {
      setLogoError(err.response?.data?.message || err.message || "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

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

  useEffect(() => {
    if (institution) {
      setName(institution.name || "");
      setType(institution.type || "School");
      setLogo(institution.logo || "");
      setEmail(institution.email || "");
      setContactNumber(institution.contactNumber || "");
      setWebsite(institution.website || "");
      setAddress(institution.address || "");
      setCity(institution.city || "");
      setState(institution.state || "");
      setPincode(institution.pincode || "");
      setAuthorizedPersonName(institution.authorizedPersonName || "");
      setAuthorizedPersonContact(institution.authorizedPersonContact || "");
      setDescription(institution.description || "");
      setCoordinatorName(institution.coordinatorName || "");
      setCoordinatorEmail(institution.coordinatorEmail || "");
      setCoordinatorPhone(institution.coordinatorPhone || "");
      setSupportedSports(Array.isArray((institution as any).supportedSports) ? (institution as any).supportedSports.join(", ") : "");
      setFacilities(typeof (institution as any).facilities === "string" ? (institution as any).facilities : "");
      setCoaches(Array.isArray((institution as any).coaches) ? (institution as any).coaches.join("\n") : "");
    }
  }, [institution]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const sportsList = supportedSports.split(",").map(s => s.trim()).filter(Boolean);
      const coachesList = coaches.split("\n").map(s => s.trim()).filter(Boolean);

      const res = await api.put("/institutions/profile", {
        name,
        type,
        logo,
        contactNumber,
        website,
        address,
        city,
        state,
        pincode,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        authorizedPersonName,
        authorizedPersonContact,
        description,
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
        supportedSports: sportsList,
        facilities,
        coaches: coachesList,
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: "Institution profile successfully updated!" });
        await refreshProfile();
      } else {
        setMessage({ type: "error", text: res.data?.message || "Failed to update profile." });
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setMessage({ type: "error", text: errorObj.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <InstitutionSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Institution Profile</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Maintain your official educational accreditation and contact information.
            </p>
          </div>

          {/* Verification Status Badge */}
          {institution?.isVerified ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Verified Institution</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Admin Verification</span>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-xs ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <School className="w-4 h-4 text-orange-400" />
              Basic Institution Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Institute">Institute</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Institution Logo / Crest
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-blue-500/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {logo ? (
                      <img src={logo} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Upload PNG, JPG, or WEBP institution emblem (Max 5MB)
                    </p>
                    {uploadingLogo && (
                      <p className="text-[11px] text-blue-400 font-bold animate-pulse">
                        Uploading official emblem...
                      </p>
                    )}
                    {logoError && (
                      <p className="text-[11px] text-red-400 font-semibold">{logoError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Official Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500">Official email cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.institution.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Description / Bio
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief history of sports and athletics infrastructure..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Campus Location & GPS
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Athletes and visiting delegations use these coordinates for venue directions.
                </p>
              </div>

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

            {locationSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-emerald-300">Campus Location Auto-Detected & Populated!</p>
                  <p className="text-[11px] text-emerald-400/90">{locationSuccessMsg}</p>
                  {latitude && longitude && (
                    <div className="pt-1 flex items-center gap-3 text-[10px]">
                      <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        GPS: {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-300 underline font-bold flex items-center gap-1 hover:text-white"
                      >
                        Verify on Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {locationErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Manual Entry Available</p>
                  <p className="text-[11px] text-amber-400/90">{locationErrorMsg}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Complete Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PIN / ZIP Code</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Authorized Officers & Sports Coordinator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              Administrative Officers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Principal / Director / Authorized Head Name
                </label>
                <input
                  type="text"
                  required
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Head Contact
                </label>
                <input
                  type="tel"
                  required
                  value={authorizedPersonContact}
                  onChange={(e) => setAuthorizedPersonContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Sports / Event Coordinator
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coordinator Name
                </label>
                <input
                  type="text"
                  required
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coordinator Email
                </label>
                <input
                  type="email"
                  required
                  value={coordinatorEmail}
                  onChange={(e) => setCoordinatorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coordinator Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={coordinatorPhone}
                  onChange={(e) => setCoordinatorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Sports Infrastructure & Coaching Staff */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              4. Sports Infrastructure, Supported Disciplines & Coaching Staff
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supported Sports Disciplines (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Athletics, Cricket, Football, Basketball, Badminton"
                  value={supportedSports}
                  onChange={(e) => setSupportedSports(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campus Facilities & Grounds Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 400m synthetic running track, 2 turf cricket nets, Olympic-sized swimming pool, indoor wooden badminton court"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coaching Staff & Mentors (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Rajesh Kumar (NIS Certified Athletics Coach)&#10;Vikram Singh (Head Cricket Coach, BCCI Level 2)"
                  value={coaches}
                  onChange={(e) => setCoaches(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
