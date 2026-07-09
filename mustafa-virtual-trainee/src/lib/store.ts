"use client";

import type { Programme, AdminSettings, Suggestion } from "./types";
import { seedProgrammes, defaultSettings } from "./data";

// ---------------------------------------------------------------------------
// Lightweight client-side persistence layer. Hydrates from seed data and
// persists user-created programmes / decisions to localStorage so the demo is
// fully functional without a backend database. In production this is swapped
// for API routes backed by the Prisma schema (see prisma/schema.prisma).
// ---------------------------------------------------------------------------

const KEYS = {
  programmes: "mustafa.programmes",
  settings: "mustafa.settings",
  decisions: "mustafa.decisions", // suggestion id -> status
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getProgrammes(): Programme[] {
    const custom = read<Programme[]>(KEYS.programmes, []);
    // seed first, then user-created (avoid duplicate ids)
    const ids = new Set(custom.map((p) => p.id));
    return [...seedProgrammes.filter((p) => !ids.has(p.id)), ...custom];
  },
  getProgramme(id: string): Programme | undefined {
    return this.getProgrammes().find((p) => p.id === id);
  },
  addProgramme(p: Programme) {
    const custom = read<Programme[]>(KEYS.programmes, []);
    write(KEYS.programmes, [...custom, p]);
  },
  getSettings(): AdminSettings {
    return read<AdminSettings>(KEYS.settings, defaultSettings);
  },
  saveSettings(s: AdminSettings) {
    write(KEYS.settings, s);
  },
  getDecisions(): Record<string, Suggestion["status"]> {
    return read(KEYS.decisions, {});
  },
  setDecision(id: string, status: Suggestion["status"]) {
    const d = this.getDecisions();
    d[id] = status;
    write(KEYS.decisions, d);
  },
};

export function newId(prefix = "p"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
