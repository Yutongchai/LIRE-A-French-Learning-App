"use client";

import { useState } from "react";
import { getApiKey, setApiKey } from "@/lib/gemini";

export default function ApiKeyDialog({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState(() => getApiKey());

  function save() {
    setApiKey(value.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gemini API key"
        className="lire-composer relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-b-none bg-[#35302e] sm:rounded-b-2xl"
      >
        <h2 className="font-serif text-2xl">Gemini API key</h2>
        <p className="mt-3 text-sm leading-6 text-[#aaa19a]">
          AI readings run straight from your browser using your own free Gemini key.
          It is stored only on this device and sent only to Google — never to this site.
        </p>
        <p className="mt-2 text-sm text-[#aaa19a]">
          Get one at{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-[#d2bb8e] underline"
          >
            aistudio.google.com/apikey
          </a>
          .
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="AIza…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="mt-5 w-full text-sm"
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={save} className="lire-primary-button flex-1 sm:flex-none">
            Save
          </button>
          {value && (
            <button
              onClick={() => {
                setApiKey("");
                setValue("");
              }}
              className="lire-secondary-button flex-1 sm:flex-none"
            >
              Remove key
            </button>
          )}
          <button onClick={onClose} className="lire-secondary-button flex-1 sm:flex-none">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
