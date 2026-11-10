/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionsHttpError } from "@supabase/supabase-js";
import type { Lesson } from "./types";
import { AccessRequiredError } from "./errors";
import { supabase } from "./supabase";

export class SignInRequiredError extends AccessRequiredError {
  constructor() {
    super("Sign in to generate and analyze readings.");
  }
}

export type Progress = {
  completed: string[];
  saved: string[];
  readLog: Record<string, string[]>;
};

export function rowToLesson(row: any): Lesson {
  return {
    id: row.id,
    language: row.language,
    script: row.script ?? undefined,
    title: row.title,
    category: row.category,
    level: row.level,
    duration: row.duration,
    content: row.content,
    translation: row.translation ?? "",
    vocabulary: row.vocabulary ?? [],
    glossary: row.glossary ?? [],
    grammar: row.grammar ?? [],
    questions: row.questions ?? [],
    analysis: row.analysis ?? "none",
  };
}

const db = () => {
  if (!supabase) throw new Error("Cloud is not configured");
  return supabase;
};

export async function callAi(body: Record<string, unknown>): Promise<Lesson> {
  const { data: s } = await db().auth.getSession();
  if (!s.session) throw new SignInRequiredError();

  const { data, error } = await db().functions.invoke("ai", { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const msg = await error.context.json().then((j: any) => j?.error).catch(() => null);
      throw new Error(msg ?? "The AI service is unavailable — try again.");
    }
    throw new Error("Network error — check your connection and try again.");
  }
  if (!data?.lesson) throw new Error("Unexpected reply from the server.");
  return rowToLesson(data.lesson);
}

export async function fetchSharedLessons(): Promise<Lesson[]> {
  const { data, error } = await db()
    .from("lessons").select("*").eq("visibility", "shared")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map(rowToLesson);
}

export async function fetchOwnLessons(userId: string): Promise<Lesson[]> {
  const { data, error } = await db()
    .from("lessons").select("*").eq("owner", userId).eq("visibility", "private")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToLesson);
}

/** Saves a pasted/imported reading privately; returns it with its real id. */
export async function insertPrivateLesson(lesson: Lesson, userId: string): Promise<Lesson> {
  const { data, error } = await db().from("lessons").insert({
    owner: userId, visibility: "private", language: lesson.language,
    script: lesson.script ?? null, title: lesson.title, category: lesson.category,
    level: lesson.level, duration: lesson.duration, content: lesson.content,
    translation: lesson.translation, vocabulary: lesson.vocabulary,
    glossary: lesson.glossary ?? [], grammar: lesson.grammar, questions: lesson.questions,
    analysis: lesson.analysis === "ready" ? "ready" : "none",
  }).select("*").single();
  if (error) throw error;
  return rowToLesson(data);
}

export async function loadProgress(userId: string): Promise<Progress | null> {
  const { data, error } = await db().from("user_progress").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data
    ? { completed: data.completed ?? [], saved: data.saved ?? [], readLog: data.read_log ?? {} }
    : null;
}

export async function saveProgress(userId: string, p: Progress) {
  const { error } = await db().from("user_progress").upsert({
    user_id: userId, completed: p.completed, saved: p.saved,
    read_log: p.readLog, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
