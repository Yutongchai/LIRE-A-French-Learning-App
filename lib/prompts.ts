import type { Language, Script } from "./languages";

export const SYSTEM_PROMPT =
  "You are an expert language teacher creating reading lessons. " +
  "Reply with ONLY one valid JSON object. No markdown fences, no commentary.";

const ZH_LENGTH: Record<string, string> = {
  "HSK 1": "60-100",
  "HSK 2": "100-150",
  "HSK 3": "150-250",
  "HSK 4": "250-350",
  "HSK 5": "350-450",
  "HSK 6": "450-600",
};

const LATIN_NAME = {
  fr: "French",
  ms: "Malay (Bahasa Melayu, standard Malaysian usage, not Indonesian)",
} as const;

const GRAMMAR_HINT = {
  fr: "",
  ms: " Where relevant, focus grammar points on affixes (imbuhan such as me-, ber-, -kan, -i), particles, or sentence structure.",
} as const;

// Phase 1: just the text (fast)
export function buildContentPrompt(
  topic: string,
  level: string,
  language: Language,
  script: Script
) {
  if (language === "zh") {
    const scriptName = script === "traditional" ? "Traditional" : "Simplified";
    return `Write a ${level} Mandarin Chinese reading about: "${topic}".
Use ${scriptName} characters. Natural Chinese, ${ZH_LENGTH[level] ?? "150-250"} characters, vocabulary and grammar suitable for ${level}. Separate paragraphs with \\n.
JSON shape: {"title":"","category":"(short English label)","duration":"(e.g. 3 min)","content":""}`;
  }

  return `Write a CEFR ${level} ${LATIN_NAME[language]} reading about: "${topic}".
Natural, native-sounding text, 120-180 words, vocabulary and grammar appropriate for ${level}. Separate paragraphs with \\n.
JSON shape: {"title":"","category":"(short English label)","duration":"(e.g. 3 min)","content":""}`;
}

// Phase 2: study notes for any text (generated, pasted, or imported)
export function buildAnalyzePrompt(content: string, level: string, language: Language) {
  if (language === "zh") {
    return `Analyze this ${level} Mandarin Chinese reading for a learner.

TEXT:
"""
${content}
"""

Return JSON:
- "translation": faithful English translation.
- "pinyin": full pinyin with tone marks for the entire text, same line breaks.
- "vocabulary": 6 useful words/phrases taken FROM the text. {word (same script as the text), pinyin, meaning (English), example (a new Chinese sentence, same script)}.
- "grammar": 2 patterns that appear in the text. {title (the pattern), explanation (English), example (quoted from the text)}.
- "questions": 3 comprehension questions in Chinese, 3 options each, "answer" = index 0-2 of the correct option. Vary the correct index.

JSON shape:
{"translation":"","pinyin":"",
"vocabulary":[{"word":"","pinyin":"","meaning":"","example":""}],
"grammar":[{"title":"","explanation":"","example":""}],
"questions":[{"question":"","options":["","",""],"answer":0}]}`;
  }

  return `Analyze this ${level} ${LATIN_NAME[language]} reading for a learner.

TEXT:
"""
${content}
"""

Return JSON:
- "translation": faithful English translation.
- "vocabulary": 5 useful words/phrases taken FROM the text. {word, meaning (English), example (a new sentence in the same language as the text)}.
- "grammar": 2 points that appear in the text. {title, explanation (English), example (quoted from the text)}.${GRAMMAR_HINT[language]}
- "questions": 3 comprehension questions in the same language as the text, 3 options each, "answer" = index 0-2 of the correct option. Vary the correct index.

JSON shape:
{"translation":"",
"vocabulary":[{"word":"","meaning":"","example":""}],
"grammar":[{"title":"","explanation":"","example":""}],
"questions":[{"question":"","options":["","",""],"answer":0}]}`;
}