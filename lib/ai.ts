import type { Analysis, Lesson } from "./types";
import type { Language, Script } from "./languages";
import { generateJSON } from "./gemini";
import { SYSTEM_PROMPT, buildAnalyzePrompt, buildContentPrompt } from "./prompts";
import { normalizeAnalysis, normalizeContent } from "./normalizeLesson";

export async function generateReading(
  topic: string,
  level: string,
  language: Language,
  script: Script
): Promise<Lesson> {
  const raw = await generateJSON(
    SYSTEM_PROMPT,
    buildContentPrompt(topic, level, language, script),
    2000
  );
  const lesson = normalizeContent(raw, level, language, script);
  if (!lesson) throw new Error("The model returned an incomplete reading — try again.");
  return lesson;
}

export async function analyzeReading(
  content: string,
  level: string,
  language: Language
): Promise<Analysis> {
  const raw = await generateJSON(
    SYSTEM_PROMPT,
    buildAnalyzePrompt(content.slice(0, 6000), level, language),
    8192
  );
  const analysis = normalizeAnalysis(raw);
  if (!analysis) throw new Error("The analysis was incomplete — try again.");
  return analysis;
}
