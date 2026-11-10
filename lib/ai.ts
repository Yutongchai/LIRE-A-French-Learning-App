import type { Lesson } from "./types";
import type { Language, Script } from "./languages";
import { generateJSON, getApiKey } from "./gemini";
import { SYSTEM_PROMPT, buildAnalyzePrompt, buildContentPrompt } from "./prompts";
import { normalizeAnalysis, normalizeContent } from "./normalizeLesson";
import { callAi } from "./cloud";
import { cloudEnabled, supabase } from "./supabase";

/** true if an AI call can start now (signed in, or a local key is saved) */
export async function hasAiAccess(): Promise<boolean> {
  if (cloudEnabled) return Boolean((await supabase!.auth.getSession()).data.session);
  return Boolean(getApiKey());
}

export async function generateReading(
  topic: string,
  level: string,
  language: Language,
  script: Script
): Promise<Lesson> {
  // cloud: the edge function returns a saved article instantly if someone already made it
  if (cloudEnabled) return callAi({ action: "generate", topic, level, language, script });

  const raw = await generateJSON(
    SYSTEM_PROMPT,
    buildContentPrompt(topic, level, language, script),
    2000
  );
  const lesson = normalizeContent(raw, level, language, script);
  if (!lesson) throw new Error("The model returned an incomplete reading — try again.");
  return lesson;
}

/** Returns the lesson fields to merge in (translation, vocabulary, glossary, ...). */
export async function analyzeReading(lesson: Lesson): Promise<Partial<Lesson>> {
  if (cloudEnabled) return callAi({ action: "analyze", lesson_id: lesson.id });

  const raw = await generateJSON(
    SYSTEM_PROMPT,
    buildAnalyzePrompt(lesson.content.slice(0, 6000), lesson.level, lesson.language),
    8192
  );
  const analysis = normalizeAnalysis(raw);
  if (!analysis) throw new Error("The analysis was incomplete — try again.");
  return analysis;
}
