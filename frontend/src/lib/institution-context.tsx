"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "./api";

export interface InstitutionProfile {
  id: string;
  name: string;
  type: string; // School, College, University, Institute
  logo?: string | null;
  email: string;
  contactNumber: string;
  website?: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  authorizedPersonName: string;
  authorizedPersonContact: string;
  description?: string | null;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  isVerified: boolean;
}

interface InstitutionContextType {
  institution: InstitutionProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, instData: InstitutionProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitution] = useState<InstitutionProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("sportrise_inst_token");
      if (!storedToken) {
        setInstitution(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      const res = await api.get("/institutions/profile", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (res.data?.success && res.data.institution) {
        setInstitution(res.data.institution);
        setToken(storedToken);
      }
    } catch (err) {
      console.warn("Institution session expired:", err);
      localStorage.removeItem("sportrise_inst_token");
      localStorage.removeItem("sportrise_inst_data");
      setInstitution(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("sportrise_inst_token");
    const savedInst = localStorage.getItem("sportrise_inst_data");

    if (savedToken && savedInst) {
      try {
        setToken(savedToken);
        setInstitution(JSON.parse(savedInst));
        refreshProfile();
      } catch {
        refreshProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = (newToken: string, instData: InstitutionProfile) => {
    localStorage.setItem("sportrise_inst_token", newToken);
    localStorage.setItem("sportrise_inst_data", JSON.stringify(instData));
    setToken(newToken);
    setInstitution(instData);
  };

  const logout = () => {
    localStorage.removeItem("sportrise_inst_token");
    localStorage.removeItem("sportrise_inst_data");
    setToken(null);
    setInstitution(null);
    if (typeof window !== "undefined") {
      window.location.href = "/institution/login";
    }
  };

  return (
    <InstitutionContext.Provider
      value={{
        institution,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error("useInstitution must be used within an InstitutionProvider");
  }
  return context;
}
