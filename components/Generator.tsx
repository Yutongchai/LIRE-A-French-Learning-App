"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/types";
import { LANGUAGES, type Language, type Script } from "@/lib/languages";

type Props = {
    language: Language;
    onGenerated: (lesson: Lesson) => void;
    onBack: () => void;
};

const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${active
        ? "border-[#d99caf] bg-[#d99caf]/15 text-[#f4dce4]"
        : "border-white/15 text-[#c6beb6] hover:bg-white/5"
    }`;

export default function Generator({ language, onGenerated, onBack }: Props) {
    const cfg = LANGUAGES[language];
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState<string>(cfg.defaultLevel);
    const [script, setScript] = useState<Script>("traditional");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function generate() {
        if (!topic.trim() || loading) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, level, language, script }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Something went wrong");
            onGenerated(data as Lesson);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="lire-composer mx-auto max-w-2xl">
            <button onClick={onBack} className="mb-6 text-sm text-[#aaa19a] hover:text-white">
                ← Back to reading
            </button>
            <p className="text-xs uppercase tracking-[0.18em] text-[#aaa19a]">
                AI reading · {cfg.label}
            </p>
            <h1 className="mt-2 font-serif text-3xl">Generate a reading</h1>
            <p className="mt-2 text-sm text-[#aaa19a]">
                Pick a topic and level. Vocabulary, grammar and questions are created with it.
            </p>

            <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder={cfg.topicPlaceholder}
                maxLength={200}
                className="mt-6 w-full text-sm"
            />

            <div className="mt-4 flex flex-wrap gap-2">
                {cfg.levels.map((l) => (
                    <button key={l} onClick={() => setLevel(l)} className={pill(level === l)}>
                        {l}
                    </button>
                ))}
            </div>

            {language === "zh" && (
                <div className="mt-3 flex gap-2">
                    <button onClick={() => setScript("traditional")} className={pill(script === "traditional")}>
                        繁體
                    </button>
                    <button onClick={() => setScript("simplified")} className={pill(script === "simplified")}>
                        简体
                    </button>
                </div>
            )}

            {error && <p className="mt-4 text-sm text-[#e7a093]">{error}</p>}

            <button
                onClick={generate}
                disabled={!topic.trim() || loading}
                className="lire-primary-button mt-6 disabled:opacity-40"
            >
                {loading ? "Writing your reading…" : "Generate reading"}      </button>
        </div>
    );
}