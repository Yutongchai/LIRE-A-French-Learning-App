"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/lib/types";
import type { Language } from "@/lib/languages";
import { loadData, saveData, todayKey } from "@/lib/storage";

const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function useLireData() {
    const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [saved, setSaved] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [readLog, setReadLog] = useState<Record<string, string[]>>({});
    useEffect(() => {
        const data = loadData();
        // eslint-disable-next-line react-hooks/set-state-in-effect

        setCustomLessons(
            (data.customLessons ?? []).map((l) => ({
                ...l,
                language: l.language ?? ("fr" as Language),
                // an analysis cut off by a refresh becomes retryable
                analysis: l.analysis === "pending" ? ("none" as const) : l.analysis,
            }))
        );
        setReadLog(data.readLog ?? {});
        setCompleted(data.completed ?? []);
        setSaved(data.saved ?? []);
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) saveData({ customLessons, completed, saved, readLog });
    }, [customLessons, completed, saved, readLog, loaded]);

    function updateLesson(id: string, patch: Partial<Lesson>) {
        setCustomLessons((cur) =>
            cur.map((l) => (l.id === id ? { ...l, ...patch } : l))
        );
    }

    async function analyzeLesson(lesson: Lesson) {
        updateLesson(lesson.id, { analysis: "pending" });
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: lesson.content,
                    level: lesson.level,
                    language: lesson.language,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Analysis failed");
            updateLesson(lesson.id, { ...data, analysis: "ready" });
        } catch {
            updateLesson(lesson.id, { analysis: "error" });
        }
    }
    function toggleCompleted(id: string) {
        const key = todayKey();
        if (completed.includes(id)) {
            setCompleted((cur) => cur.filter((x) => x !== id));
            setReadLog((cur) => {
                const ids = (cur[key] ?? []).filter((x) => x !== id);
                const next = { ...cur };
                if (ids.length) next[key] = ids;
                else delete next[key];
                return next;
            });
        } else {
            setCompleted((cur) => [...cur, id]);
            setReadLog((cur) => {
                const ids = cur[key] ?? [];
                return ids.includes(id) ? cur : { ...cur, [key]: [...ids, id] };
            });
        }
    }
    return {
        customLessons,
        completed,
        saved,
        readLog,
        addLesson: (lesson: Lesson) =>
            setCustomLessons((cur) => [...cur, lesson]),
        analyzeLesson,
        toggleSaved: (id: string) => setSaved((cur) => toggle(cur, id)),
        toggleCompleted,
    };
}