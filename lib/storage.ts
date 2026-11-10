import type { Lesson } from "./types";

const STORAGE_KEY = "lire-personal-data";

export type StoredData = {
  customLessons: Lesson[];
  completed: string[];
  saved: string[];
  readLog: Record<string, string[]>;
};

export function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function logRead(data: StoredData, lessonId: string): StoredData {
  const key = todayKey();
  const ids = data.readLog?.[key] ?? [];
  if (ids.includes(lessonId)) return data;
  return { ...data, readLog: { ...data.readLog, [key]: [...ids, lessonId] } };
}

export function loadData(): Partial<StoredData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    console.warn("Could not load LIRE data.");
    return {};
  }
}

export function saveData(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn("Could not save LIRE data.");
  }
}
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
