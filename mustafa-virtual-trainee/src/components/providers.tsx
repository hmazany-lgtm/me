"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, User, Role } from "@/lib/types";
import { dict, enumLabels } from "@/lib/i18n";
import { seedUsers } from "@/lib/data";

// --- Language context ------------------------------------------------------

interface LangCtx {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

export function useLang(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within Providers");
  return ctx;
}

// --- Auth context (mock) ---------------------------------------------------

interface AuthCtx {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  users: User[];
  can: (perm: Permission) => boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}

// --- Permissions matrix ----------------------------------------------------

export type Permission =
  | "manage_programmes"
  | "run_sessions"
  | "manage_settings"
  | "manage_users"
  | "export_reports"
  | "view";

const rolePerms: Record<Role, Permission[]> = {
  admin: ["manage_programmes", "run_sessions", "manage_settings", "manage_users", "export_reports", "view"],
  programme_manager: ["manage_programmes", "export_reports", "view"],
  trainer: ["run_sessions", "export_reports", "view"],
  coordinator: ["export_reports", "view"],
  viewer: ["view"],
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [user, setUser] = useState<User | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    const savedLocale = window.localStorage.getItem("mustafa.locale") as Locale | null;
    if (savedLocale) setLocaleState(savedLocale);
    const savedUser = window.localStorage.getItem("mustafa.user");
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("mustafa.locale", l);
  };

  const t = useMemo(() => {
    return (key: string) => {
      const entry = dict[key] || enumLabels[key];
      return entry ? entry[locale] : key;
    };
  }, [locale]);

  const langValue: LangCtx = {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    setLocale,
    toggle: () => setLocale(locale === "ar" ? "en" : "ar"),
    t,
  };

  const authValue: AuthCtx = {
    user,
    users: seedUsers,
    login: (u) => {
      setUser(u);
      window.localStorage.setItem("mustafa.user", JSON.stringify(u));
    },
    logout: () => {
      setUser(null);
      window.localStorage.removeItem("mustafa.user");
    },
    can: (perm) => (user ? rolePerms[user.role].includes(perm) : false),
  };

  return (
    <LanguageContext.Provider value={langValue}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </LanguageContext.Provider>
  );
}
