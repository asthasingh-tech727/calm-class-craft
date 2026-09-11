import { useCallback, useEffect, useState } from "react";
import { DEMO_DATA } from "./demoData";
import type { Assignment, TimetableData } from "./types";

const KEY_DATA = "stt.data.v1";
const KEY_SCHEDULE = "stt.schedule.v1";
const KEY_THEME = "stt.theme.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function useTimetableStore() {
  const [hydrated, setHydrated] = useState(false);
  const [data, setDataState] = useState<TimetableData>(() => clone(DEMO_DATA));
  const [schedule, setScheduleState] = useState<Assignment[] | null>(null);

  useEffect(() => {
    setDataState(read(KEY_DATA, clone(DEMO_DATA)));
    setScheduleState(read<Assignment[] | null>(KEY_SCHEDULE, null));
    setHydrated(true);
  }, []);

  const setData = useCallback((next: TimetableData | ((p: TimetableData) => TimetableData)) => {
    setDataState((prev) => {
      const value = typeof next === "function" ? (next as (p: TimetableData) => TimetableData)(prev) : next;
      write(KEY_DATA, value);
      return value;
    });
  }, []);

  const setSchedule = useCallback((next: Assignment[] | null) => {
    setScheduleState(next);
    write(KEY_SCHEDULE, next);
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = clone(DEMO_DATA);
    setDataState(fresh);
    write(KEY_DATA, fresh);
    setScheduleState(null);
    write(KEY_SCHEDULE, null);
  }, []);

  return { data, setData, schedule, setSchedule, resetDemo, hydrated };
}

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = read<boolean | null>(KEY_THEME, null);
    const initial =
      stored ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(Boolean(initial));
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((d) => {
      write(KEY_THEME, !d);
      return !d;
    });
  }, []);

  return { dark, toggle };
}
