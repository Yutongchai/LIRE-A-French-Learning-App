"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/types";
import { LANGUAGES, type Language, type Script } from "@/lib/languages";
import { generateReading, hasAiAccess } from "@/lib/ai";
import { AccessRequiredError } from "@/lib/errors";
import ProgressBar from "./ProgressBar";

type Props = {
    language: Language;
    onGenerated: (lesson: Lesson) => void;
    onBack: () => void;
    onNeedKey: () => void;
};

const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${active
        ? "border-[#d99caf] bg-[#d99caf]/15 text-[#f4dce4]"
        : "border-white/15 text-[#c6beb6] hover:bg-white/5"
    }`;

export default function Generator({ language, onGenerated, onBack, onNeedKey }: Props) {
    const cfg = LANGUAGES[language];
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState<string>(cfg.defaultLevel);
    const [script, setScript] = useState<Script>("traditional");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function generate() {
        if (!topic.trim() || loading) return;
        if (!(await hasAiAccess())) {
            setError("Sign in (or add your API key) first.");
            onNeedKey();
            return;
        }
        setLoading(true);
        setDone(false);
        setError("");
        try {
            const lesson = await generateReading(topic.trim(), level, language, script);
            setDone(true); // bar jumps to 100%
            await new Promise((r) => setTimeout(r, 600));
            onGenerated(lesson); // page then starts the analysis automatically
        } catch (e) {
            if (e instanceof AccessRequiredError) onNeedKey();
            setError(e instanceof Error ? e.message : "Something went wrong");
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
                Pick a topic and level. The text is written first, then the study notes are added automatically.
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

            {loading ? (
                <div className="mt-6">
                    <ProgressBar label={done ? "Reading ready" : "Writing your reading…"} done={done} />
                    <p className="mt-3 text-xs text-[#aaa19a]">
                        Translation, vocabulary, grammar and word notes will be prepared
                        automatically next.
                    </p>
                </div>
            ) : (
                <button
                    onClick={generate}
                    disabled={!topic.trim()}
                    className="lire-primary-button mt-6 w-full disabled:opacity-40 sm:w-auto"
                >
                    Generate reading
                </button>
            )}
        </div>
    );
}