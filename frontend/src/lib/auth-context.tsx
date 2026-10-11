"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "./api";

export interface AthleteUser {
  id: string;
  athleteId: string;
  fullName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  sport: string;
  ageCategory: string;
  gender: string;
  skillIndex: number;
  nationalRank?: number;
  stateRank?: number;
  districtRank?: number;
  bio?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: AthleteUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: AthleteUser) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AthleteUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("sportrise_token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      const res = await api.get("/auth/profile");
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        setToken(storedToken);
      }
    } catch (err) {
      console.warn("Session expired or invalid:", err);
      localStorage.removeItem("sportrise_token");
      localStorage.removeItem("sportrise_user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load from localStorage
    const savedToken = localStorage.getItem("sportrise_token");
    const savedUser = localStorage.getItem("sportrise_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Silently revalidate in background
        refreshProfile();
      } catch {
        refreshProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = (newToken: string, userData: AthleteUser) => {
    localStorage.setItem("sportrise_token", newToken);
    localStorage.setItem("sportrise_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sportrise_token");
    localStorage.removeItem("sportrise_user");
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
