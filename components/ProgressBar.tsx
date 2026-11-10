"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  /** set true once the work finished: the bar jumps to 100% */
  done?: boolean;
};

/**
 * Model calls give no real progress events, so while mounted the bar eases
 * toward ~92%, and `done` snaps it to 100%. Mount it only while work runs.
 */
export default function ProgressBar({ label, done = false }: Props) {
  const [eased, setEased] = useState(1);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setEased((v) => (v >= 92 ? v : Math.min(92, v + Math.max(0.4, (92 - v) * 0.06))));
    }, 200);
    return () => clearInterval(id);
  }, [done]);

  const pct = done ? 100 : Math.max(1, Math.round(eased));

  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0">{label}</span>
        <span className="shrink-0 font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/15">
        <div
          className="h-full rounded-full bg-[#d99caf] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
