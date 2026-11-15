"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AvatarExpression } from "@/lib/openhub-data";

export interface OpenHubUser {
  email: string;
  pseudo: string;
  expression: AvatarExpression;
  signedInAt: string;
}

interface AuthContextValue {
  user: OpenHubUser | null;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (
    email: string,
    pseudo: string,
    expression?: AvatarExpression
  ) => { ok: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = "openhub_user_session_v1";

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<OpenHubUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OpenHubUser;
        if (parsed && parsed.email && parsed.pseudo) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore malformed session
    }
  }, []);

  const login = (
    email: string,
    pseudo: string,
    expression: AvatarExpression = "spectateur-a"
  ) => {
    const cleanEmail = email.trim();
    const cleanPseudo = pseudo.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { ok: false, error: "Veuillez saisir une adresse e-mail valide." };
    }
    if (cleanPseudo.length < 2) {
      return {
        ok: false,
        error: "Veuillez choisir un pseudo d'au moins 2 caractères.",
      };
    }

    const nextUser: OpenHubUser = {
      email: cleanEmail,
      pseudo: cleanPseudo,
      expression,
      signedInAt: new Date().toISOString(),
    };
    setUser(nextUser);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage quota errors
    }
    setAuthModalOpen(false);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authModalOpen,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
