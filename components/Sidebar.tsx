"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Lesson } from "@/lib/types";
import { todayKey } from "@/lib/storage";


type Props = {
  lessons: Lesson[];
  selectedId: string;
  completedCount: number;
  savedCount: number;
  customCount: number;
  readLog: Record<string, string[]>; // "2026-11-09" -> lesson ids
  onSelect: (id: string) => void;
  onAdd: () => void;
  onGenerate: () => void;
};

const SHADES = ["#eeece5", "#cfd8ca", "#a3b59d", "#71816c"];
const noopSubscribe = () => () => { };

function ReadingCalendar({ readLog }: { readLog: Props["readLog"] }) {
  // "" on the server, today's local date in the browser (no hydration mismatch)
  const today = useSyncExternalStore(noopSubscribe, () => todayKey(), () => "");
  if (!today) return <div className="mt-4 h-28" />;

  const [year, m] = today.split("-").map(Number);
  const month = m - 1;
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-[#89877e]">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-center text-[10px] text-[#99958a]">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const key = todayKey(new Date(year, month, d));
          const count = readLog[key]?.length ?? 0;
          const shade = SHADES[Math.min(count, 3)];
          return (
            <span
              key={i}
              title={`${key}: ${count} read`}
              className={`aspect-square rounded-[4px] ${key === today ? "ring-2 ring-[#d99caf]" : ""
                }`}
              style={{ backgroundColor: shade }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  lessons,
  selectedId,
  completedCount,
  savedCount,
  customCount,
  readLog,
  onSelect,
  onAdd,
  onGenerate,

}: Props) {
  // lesson id -> most recent day it was read
  const lastRead = useMemo(() => {
    const map: Record<string, string> = {};
    for (const day of Object.keys(readLog).sort()) {
      for (const id of readLog[day]) map[id] = day;
    }
    return map;
  }, [readLog]);

  const formatDay = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <aside className="lire-sidebar space-y-8">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
          Your space
        </p>
        <div className="rounded-xl border border-[#e8e5dc] bg-white p-4">
          <p className="font-serif text-3xl">
            {completedCount}
            <span className="ml-2 text-sm text-[#99958a]">readings</span>
          </p>
          <p className="mt-1 text-xs text-[#89877e]">Completed</p>
          <ReadingCalendar readLog={readLog} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
          Reading library
        </p>
        <div className="space-y-1">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson.id)}
              className={`lire-library-item w-full px-3 py-3 text-left text-sm transition ${selectedId === lesson.id ? "is-active" : ""
                }`}
            >
              <span className="block font-medium">{lesson.title}</span>
              <span className="mt-1 block text-xs opacity-70">
                {lesson.level} · {lesson.category}
                {lastRead[lesson.id] && ` · Read ${formatDay(lastRead[lesson.id])}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
          Personal collection
        </p>
        <button
          onClick={onGenerate}
          className="mb-2 w-full rounded-lg bg-[#d99caf] px-3 py-3 text-left text-sm font-medium text-[#302528] hover:bg-[#e7b4c4]"
        >
          ✦ Generate a reading
        </button>
        <button
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-[#c9c6ba] px-3 py-3 text-left text-sm text-[#68675e] hover:bg-white"
        >
          + Add your own reading
        </button>
        <p className="mt-3 text-xs text-[#99958a]">
          {savedCount} saved · {customCount} custom readings
        </p>
      </div>
    </aside>
  );
}
