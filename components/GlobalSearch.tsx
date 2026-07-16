"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hazard } from "@/lib/types";
import { normalizeHazard } from "@/lib/firestore-helpers";
import { formatDate } from "@/lib/style-helpers";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import { IconSearch, IconX } from "@tabler/icons-react";

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 8;

function matchesQuery(hazard: Hazard, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  const location = `${hazard.latitude?.toFixed(4) ?? ""} ${hazard.longitude?.toFixed(4) ?? ""}`;
  const haystack = [
    hazard.hazardType,
    hazard.reporterName,
    hazard.description,
    hazard.id,
    location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

interface GlobalSearchProps {
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function GlobalSearch({
  showTrigger = true,
  open: controlledOpen,
  onOpenChange,
}: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setHazards(snap.docs.map((d) => normalizeHazard(d.id, d.data())));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return hazards.filter((h) => matchesQuery(h, debouncedQuery)).slice(0, MAX_RESULTS);
  }, [hazards, debouncedQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  const openSearch = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(0);
  }, []);

  const navigateTo = useCallback(
    (id: string) => {
      closeSearch();
      router.push(`/reports/${id}`);
    },
    [closeSearch, router]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closeSearch();
        else openSearch();
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        navigateTo(results[activeIndex].id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSearch, openSearch, results, activeIndex, navigateTo]);

  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  const shortcut = isMac ? "⌘K" : "Ctrl+K";

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={openSearch}
          className="flex items-center gap-2 mx-2 mb-2 px-2.5 py-2 rounded-lg text-xs text-fog-400 border border-asphalt-800 hover:border-asphalt-700 hover:text-fog-200 hover:bg-asphalt-900 transition-colors w-[calc(100%-1rem)]"
        >
          <IconSearch size={14} />
          <span className="flex-1 text-left">Search reports…</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-asphalt-800 text-fog-500 font-mono">
            {shortcut}
          </kbd>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-[2px]"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-700 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-fog-100 dark:border-asphalt-800">
              <IconSearch size={16} className="text-fog-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by type, reporter, description, or location…"
                className="flex-1 text-sm bg-transparent outline-none text-asphalt-950 dark:text-fog-50 placeholder:text-fog-400"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="p-1 rounded text-fog-400 hover:text-fog-600 hover:bg-fog-50 dark:hover:bg-asphalt-800"
                aria-label="Close search"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {!debouncedQuery.trim() && (
                <p className="px-4 py-6 text-xs text-center text-fog-400">
                  Type to search hazard reports
                </p>
              )}
              {debouncedQuery.trim() && results.length === 0 && (
                <p className="px-4 py-6 text-xs text-center text-fog-400">
                  No reports match &ldquo;{debouncedQuery}&rdquo;
                </p>
              )}
              {results.map((h, i) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => navigateTo(h.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-3 border-t border-fog-100 dark:border-asphalt-800 transition-colors ${
                    i === activeIndex
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "hover:bg-fog-50 dark:hover:bg-asphalt-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-asphalt-950 dark:text-fog-50 truncate">
                        {h.hazardType}
                      </p>
                      <p className="text-xs text-fog-500 truncate mt-0.5">{h.reporterName}</p>
                      {h.description && (
                        <p className="text-[11px] text-fog-400 truncate mt-1">{h.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        <StatusBadge status={h.status} />
                        <RiskBadge risk={h.riskLevel} />
                      </div>
                      <p className="text-[10px] text-fog-400 mt-1.5">{formatDate(h.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
