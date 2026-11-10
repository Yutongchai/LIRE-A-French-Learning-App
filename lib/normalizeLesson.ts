/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Analysis, Lesson } from "./types";
import type { Language, Script } from "./languages";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function normalizeContent(
  raw: any,
  level: string,
  language: Language,
  script: Script
): Lesson | null {
  const content = str(raw?.content);
  const title = str(raw?.title);
  if (!content || !title) return null;

  return {
    id: `ai-${Date.now()}`,
    language,
    script: language === "zh" ? script : undefined,
    title,
    category: str(raw.category) || "AI reading",
    level,
    duration: str(raw.duration) || "5 min",
    content,
    translation: "",
    vocabulary: [],
    grammar: [],
    questions: [],
    analysis: "none",
  };
}

export function normalizeAnalysis(raw: any): Analysis | null {
  const vocabulary = (Array.isArray(raw?.vocabulary) ? raw.vocabulary : [])
    .map((v: any) => ({
      word: str(v?.word),
      meaning: str(v?.meaning),
      example: str(v?.example),
      pinyin: str(v?.pinyin) || undefined,
    }))
    .filter((v: { word: string }) => v.word);

  const grammar = (Array.isArray(raw?.grammar) ? raw.grammar : [])
    .map((g: any) => ({
      title: str(g?.title),
      explanation: str(g?.explanation),
      example: str(g?.example),
    }))
    .filter((g: { title: string }) => g.title);

  const questions = (Array.isArray(raw?.questions) ? raw.questions : [])
    .map((q: any) => ({
      question: str(q?.question),
      options: Array.isArray(q?.options) ? q.options.map(str) : [],
      answer: Number.isInteger(q?.answer) ? q.answer : -1,
    }))
    .filter(
      (q: { question: string; options: string[]; answer: number }) =>
        q.question &&
        q.options.length >= 2 &&
        q.answer >= 0 &&
        q.answer < q.options.length
    );

  const translation = str(raw?.translation);
  if (!translation && !vocabulary.length && !questions.length) return null;

  return {
    translation,
    pinyin: str(raw?.pinyin) || undefined,
    vocabulary,
    grammar,
    questions,
  };
}