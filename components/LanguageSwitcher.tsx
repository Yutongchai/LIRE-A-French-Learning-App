"use client";

import "flag-icons/css/flag-icons.min.css";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, type Language } from "@/lib/languages";

type Props = {
  value: Language;
  onChange: (l: Language) => void;
};

export default function LanguageSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGUAGES[value];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 text-sm text-[#f2eee7] transition hover:bg-white/5"
      >
        <span className={`fi fi-${current.flag} rounded-[3px] text-base`} />
        <span className="hidden sm:inline">{current.label}</span>
        <span
          className={`text-[10px] text-[#c6beb6] transition ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-white/15 bg-[#35302e] p-1 shadow-xl"
        >
          {(Object.keys(LANGUAGES) as Language[]).map((l) => {
            const item = LANGUAGES[l];
            const active = l === value;
            return (
              <li key={l} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(l);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-[#d99caf]/15 text-[#f4dce4]"
                      : "text-[#c6beb6] hover:bg-white/5 hover:text-[#f2eee7]"
                  }`}
                >
                  <span className={`fi fi-${item.flag} rounded-[3px] text-base`} />
                  <span className="flex-1">{item.label}</span>
                  {active && <span className="text-[#d99caf]">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}