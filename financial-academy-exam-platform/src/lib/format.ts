import { CERTIFICATIONS, USERS, CENTERS } from "@/data/seed";

export const sar = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " SAR";

export const num = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const pct = (n: number) => `${Math.round(n)}%`;

export const certName = (id: string) => CERTIFICATIONS.find((c) => c.id === id)?.name ?? id;
export const certCode = (id: string) => CERTIFICATIONS.find((c) => c.id === id)?.code ?? id;
export const userName = (id: string) => USERS.find((u) => u.id === id)?.fullName ?? id;
export const centerName = (id: string) => CENTERS.find((c) => c.id === id)?.name ?? id;

export const shortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

export const dateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

export const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Mask a sensitive value, keeping the last `keep` characters. */
export const mask = (v: string, keep = 3) =>
  v.length <= keep ? "•••" : "•••• " + v.slice(-keep);
