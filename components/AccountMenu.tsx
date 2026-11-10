"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function AccountMenu({ user, onSignIn }: { user: User | null; onSignIn: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#f2eee7] hover:bg-white/5"
      >
        Sign in
      </button>
    );
  }

  const name: string = user.user_metadata?.full_name ?? user.email ?? "Account";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-haspopup="menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d99caf] text-sm font-semibold text-[#302528]"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-white/15 bg-[#35302e] p-3 shadow-xl"
        >
          <p className="truncate text-sm text-[#f2eee7]">{name}</p>
          {user.email && name !== user.email && (
            <p className="truncate text-xs text-[#aaa19a]">{user.email}</p>
          )}
          <button
            onClick={() => supabase?.auth.signOut()}
            className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-[#f2eee7] hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
