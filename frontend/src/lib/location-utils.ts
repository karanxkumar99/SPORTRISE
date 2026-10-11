import { ALL_INDIAN_STATES } from "@/data/india-locations";

export interface GeocodedLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Intelligent normalization of state names to match official Indian States and UTs list
 */
export function matchIndianState(rawState: string): string {
  if (!rawState) return "Delhi (NCT)";

  const clean = rawState.trim().toLowerCase();

  // Common aliases and variations
  if (clean.includes("delhi") || clean.includes("nct")) return "Delhi (NCT)";
  if (clean.includes("orissa")) return "Odisha";
  if (clean.includes("pondicherry")) return "Puducherry";
  if (clean.includes("uttaranchal")) return "Uttarakhand";
  if (clean.includes("jammu") || clean.includes("kashmir")) return "Jammu and Kashmir";
  if (clean.includes("ladakh")) return "Ladakh";
  if (clean.includes("andaman") || clean.includes("nicobar")) return "Andaman and Nicobar Islands";
  if (clean.includes("daman") || clean.includes("diu") || clean.includes("dadra") || clean.includes("haveli")) {
    return "Dadra and Nagar Haveli and Daman and Diu";
  }

  // Exact or substring match in ALL_INDIAN_STATES
  const exact = ALL_INDIAN_STATES.find(
    (s) => s.toLowerCase() === clean
  );
  if (exact) return exact;

  const partial = ALL_INDIAN_STATES.find(
    (s) => clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)
  );
  if (partial) return partial;

  return "Delhi (NCT)";
}

/**
 * Request device/browser GPS coordinates
 */
export function getCurrentGPSCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser or environment."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow location access in your browser to auto-detect your campus.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable on this device or network.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again or enter details manually.";
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse Geocode coordinates to Indian address fields using OpenStreetMap with BigDataCloud fallback
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<GeocodedLocation> {
  // 1. Try OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(nominatimUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;

        // Street address parts
        const streetParts: string[] = [];
        if (addr.amenity) streetParts.push(addr.amenity);
        if (addr.building) streetParts.push(addr.building);
        if (addr.road) streetParts.push(addr.road);
        if (addr.suburb) streetParts.push(addr.suburb);
        if (addr.neighbourhood) streetParts.push(addr.neighbourhood);
        if (addr.residential) streetParts.push(addr.residential);

        const addressLine = streetParts.length > 0 ? streetParts.join(", ") : (data.name || "");
        const cityLine = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        const stateLine = matchIndianState(addr.state || "");
        const pincodeLine = addr.postcode ? addr.postcode.replace(/\s+/g, "") : "";

        return {
          address: addressLine || "Campus Premises",
          city: cityLine || "Local District",
          state: stateLine,
          pincode: pincodeLine,
          country: addr.country || "India",
          latitude,
          longitude,
          formattedAddress: data.display_name || `${addressLine}, ${cityLine}, ${stateLine}`,
        };
      }
    }
  } catch (nominatimErr) {
    console.warn("Nominatim reverse geocode failed, trying fallback...", nominatimErr);
  }

  // 2. Fallback to BigDataCloud reverse geocode API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const bdcData = await res.json();
      const cityLine = bdcData.city || bdcData.locality || bdcData.principalSubdivision || "";
      const stateLine = matchIndianState(bdcData.principalSubdivision || "");
      const addressLine = bdcData.locality ? `${bdcData.locality}, Campus Area` : "Campus Premises";

      return {
        address: addressLine,
        city: cityLine,
        state: stateLine,
        pincode: bdcData.postcode || "",
        country: bdcData.countryName || "India",
        latitude,
        longitude,
        formattedAddress: `${addressLine}, ${cityLine}, ${stateLine}`,
      };
    }
  } catch (bdcErr) {
    console.warn("BigDataCloud fallback failed:", bdcErr);
  }

  // Fallback return if reverse geocoding services unreachable
  return {
    address: `Campus Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    city: "Local District",
    state: "Delhi (NCT)",
    pincode: "",
    country: "India",
    latitude,
    longitude,
    formattedAddress: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
  };
}
