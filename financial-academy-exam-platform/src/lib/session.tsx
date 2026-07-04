"use client";
/**
 * Session / identity context. Authentication is a PLACEHOLDER in the prototype:
 * instead of a real login, a role switcher lets stakeholders experience the
 * platform through each role's permission lens. The active user drives every
 * RBAC decision, the watermark, and the (in-memory) audit trail.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { USERS } from "@/data/seed";
import type { AuditAction } from "./types";

interface AuditEvent {
  action: AuditAction | string;
  object: string;
  risk: "low" | "medium" | "high";
  at: string;
}

interface SessionCtx {
  user: User;
  setUserById: (id: string) => void;
  ip: string;
  events: AuditEvent[];
  logAccess: (e: Omit<AuditEvent, "at">) => void;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>("u-exec");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [ip, setIp] = useState("10.20.14.207");

  // Persist the chosen demo role across navigations.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("tfa-role") : null;
    if (saved && USERS.some((u) => u.id === saved)) setUserId(saved);
  }, []);

  const user = useMemo(() => USERS.find((u) => u.id === userId) ?? USERS[0], [userId]);

  const value: SessionCtx = {
    user,
    ip,
    events,
    setUserById: (id) => {
      setUserId(id);
      if (typeof window !== "undefined") window.localStorage.setItem("tfa-role", id);
    },
    logAccess: (e) =>
      setEvents((prev) => [{ ...e, at: new Date().toISOString() }, ...prev].slice(0, 40)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
