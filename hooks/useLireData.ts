"use client";

import { useEffect, useRef, useState } from "react";
import type { Lesson } from "@/lib/types";
import type { Language } from "@/lib/languages";
import { analyzeReading } from "@/lib/ai";
import { loadData, saveData, clearData, todayKey } from "@/lib/storage";
import { cloudEnabled } from "@/lib/supabase";
import {
    fetchOwnLessons,
    fetchSharedLessons,
    insertPrivateLesson,
    loadProgress,
    saveProgress,
} from "@/lib/cloud";

const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

function fixLocal(l: Lesson): Lesson {
    return {
        ...l,
        language: l.language ?? ("fr" as Language),
        // an analysis cut off by a refresh becomes retryable
        analysis: l.analysis === "pending" ? ("none" as const) : l.analysis,
    };
}

/**
 * Storage modes
 *  - local: no Supabase configured, or signed out -> everything in this browser
 *  - cloud: signed in -> progress + private readings in Supabase, shared library public
 * `userId` switching from null to an id uploads whatever the browser already had.
 */
export function useLireData(userId: string | null) {
    const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
    const [sharedLessons, setSharedLessons] = useState<Lesson[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [saved, setSaved] = useState<string[]>([]);
    const [readLog, setReadLog] = useState<Record<string, string[]>>({});
    // which storage the in-memory state currently mirrors (guards against saving too early)
    const [loadedFor, setLoadedFor] = useState<string | null>(null);
    const [syncError, setSyncError] = useState("");
    const mode = userId ?? "local";

    /* ---------- shared library (public) ---------- */
    useEffect(() => {
        if (!cloudEnabled) return;
        fetchSharedLessons().then(setSharedLessons).catch(() => { });
    }, [userId]);

    /* ---------- load on mount / on sign-in / on sign-out ---------- */
    useEffect(() => {
        let cancelled = false;

        async function loadCloud(uid: string) {
            const local = loadData();
            const [remoteLessons, remoteProgress] = await Promise.all([
                fetchOwnLessons(uid),
                loadProgress(uid),
            ]);

            let lessons = remoteLessons;
            let done = remoteProgress?.completed ?? [];
            let sav = remoteProgress?.saved ?? [];
            let log = remoteProgress?.readLog ?? {};

            // first sign-in on a browser that already has data: upload it once
            const localLessons = (local.customLessons ?? []).map(fixLocal);
            const hasLocal =
                localLessons.length || local.completed?.length || local.saved?.length ||
                Object.keys(local.readLog ?? {}).length;
            if (hasLocal) {
                const idMap: Record<string, string> = {};
                for (const l of localLessons) {
                    const created = await insertPrivateLesson(l, uid);
                    idMap[l.id] = created.id;
                    lessons = [...lessons, created];
                }
                const remap = (id: string) => idMap[id] ?? id;
                done = union(done, (local.completed ?? []).map(remap));
                sav = union(sav, (local.saved ?? []).map(remap));
                const merged = { ...log };
                for (const [day, ids] of Object.entries(local.readLog ?? {})) {
                    merged[day] = union(merged[day] ?? [], ids.map(remap));
                }
                log = merged;
                await saveProgress(uid, { completed: done, saved: sav, readLog: log });
                clearData(); // safely in the cloud now
            }
            if (cancelled) return;
            setCustomLessons(lessons);
            setCompleted(done);
            setSaved(sav);
            setReadLog(log);
            setLoadedFor(uid);
        }

        function loadLocal() {
            const data = loadData();
            setCustomLessons((data.customLessons ?? []).map(fixLocal));
            setReadLog(data.readLog ?? {});
            setCompleted(data.completed ?? []);
            setSaved(data.saved ?? []);
            setLoadedFor("local");
        }

        if (userId) {
            loadCloud(userId).catch((e) => {
                console.error(e);
                setSyncError("Could not load your data from the cloud.");
            });
        } else {
            loadLocal();
        }
        return () => {
            cancelled = true;
        };
    }, [userId]);

    /* ---------- persist ---------- */
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (loadedFor !== mode) return;
        if (!userId) {
            saveData({ customLessons, completed, saved, readLog });
            return;
        }
        // cloud: only the tracker is saved here (readings are saved when created)
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            saveProgress(userId, { completed, saved, readLog })
                .then(() => setSyncError(""))
                .catch(() => setSyncError("Could not save progress — check your connection."));
        }, 700);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [customLessons, completed, saved, readLog, loadedFor, mode, userId]);

    /* ---------- readings ---------- */
    function updateLesson(id: string, patch: Partial<Lesson>) {
        const apply = (cur: Lesson[]) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l));
        setCustomLessons(apply);
        setSharedLessons(apply);
    }

    /** Adds a pasted reading. In cloud mode it is saved first so it gets its real id. */
    async function addLesson(lesson: Lesson): Promise<Lesson> {
        let final = lesson;
        if (userId) final = await insertPrivateLesson(lesson, userId);
        setCustomLessons((cur) => [...cur, final]);
        return final;
    }

    /** A generated reading from the shared library (already saved server-side). */
    function addSharedLesson(lesson: Lesson) {
        setSharedLessons((cur) => (cur.some((l) => l.id === lesson.id) ? cur : [lesson, ...cur]));
        // local mode has no shared library: keep it in the browser instead
        if (!cloudEnabled) setCustomLessons((cur) => [...cur, lesson]);
    }

    async function analyzeLesson(lesson: Lesson) {
        updateLesson(lesson.id, { analysis: "pending", analysisError: undefined });
        try {
            const data = await analyzeReading(lesson);
            updateLesson(lesson.id, { ...data, analysis: "ready", analysisError: undefined });
        } catch (e) {
            updateLesson(lesson.id, {
                analysis: "error",
                analysisError: e instanceof Error ? e.message : "Analysis failed",
            });
        }
    }

    /* ---------- tracker ---------- */
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
        sharedLessons,
        completed,
        saved,
        readLog,
        syncError,
        addLesson,
        addSharedLesson,
        analyzeLesson,
        toggleSaved: (id: string) => setSaved((cur) => toggle(cur, id)),
        toggleCompleted,
    };
}
