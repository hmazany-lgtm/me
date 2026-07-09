
import { useEffect, useState } from "react";
import { useLang } from "./providers";
import { store } from "@/lib/store";
import type { Programme } from "@/lib/types";

// Hook: load programmes and manage a selected programme id (optionally seeded
// from a `?p=` query param).
export function usePrograms(initialId?: string) {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const list = store.getProgrammes();
    setProgrammes(list);
    const fromQuery = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("p")
      : null;
    setSelectedId(initialId || fromQuery || (list[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = programmes.find((p) => p.id === selectedId);
  return { programmes, selectedId, setSelectedId, selected };
}

export function ProgrammePicker({
  programmes, value, onChange,
}: { programmes: Programme[]; value: string; onChange: (id: string) => void }) {
  const { t, locale } = useLang();
  return (
    <div>
      <label className="label">{t("selectProgramme")}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>{locale === "ar" ? p.nameAr : p.name}</option>
        ))}
      </select>
    </div>
  );
}
