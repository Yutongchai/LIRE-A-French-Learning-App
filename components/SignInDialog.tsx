"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { AUTH_PROVIDERS, supabase } from "@/lib/supabase";

const PROVIDERS: Record<string, { label: string; provider: Provider }> = {
  google: { label: "Continue with Google", provider: "google" },
  azure: { label: "Continue with Microsoft", provider: "azure" },
  apple: { label: "Continue with Apple", provider: "apple" },
};

export default function SignInDialog({ onClose, reason }: { onClose: () => void; reason?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(provider: Provider) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${base}/` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    } // on success the browser navigates to the provider
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        className="lire-composer relative max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-b-none bg-[#35302e] sm:rounded-b-2xl"
      >
        <h2 className="font-serif text-2xl">Sign in to LIRE</h2>
        <p className="mt-3 text-sm leading-6 text-[#aaa19a]">
          {reason ?? "Your progress, saved words and readings follow you on every device."}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {AUTH_PROVIDERS.filter((p) => PROVIDERS[p]).map((p) => (
            <button
              key={p}
              disabled={busy}
              onClick={() => signIn(PROVIDERS[p].provider)}
              className="lire-secondary-button w-full justify-center py-3 disabled:opacity-50"
            >
              {PROVIDERS[p].label}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-[#e7a093]">{error}</p>}
        <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-[#aaa19a] hover:text-white">
          Not now
        </button>
      </div>
    </div>
  );
}
