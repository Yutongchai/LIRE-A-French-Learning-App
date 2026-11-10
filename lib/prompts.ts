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

const LANG_NAME = {
  fr: "French",
  ms: "Malay (Bahasa Melayu, standard Malaysian usage, not Indonesian)",
  zh: "Mandarin Chinese",
  th: "Thai",
} as const;

const GRAMMAR_HINT: Record<Language, string> = {
  fr: "",
  zh: "",
  ms: " Where relevant, focus grammar points on affixes (imbuhan such as me-, ber-, -kan, -i), particles, or sentence structure.",
  th: " Where relevant, focus on particles (ครับ/ค่ะ/นะ), classifiers, aspect markers (กำลัง/แล้ว/จะ) or word order.",
};

/** What goes in each entry's "reading" field. Empty = leave it out. */
const READING_HINT: Record<Language, string> = {
  fr: "IPA pronunciation in slashes, e.g. /lyks/",
  zh: "pinyin with tone marks, e.g. shēnghuó",
  ms: "",
  th: "romanization with tone marks (Paiboon style), e.g. sà-wàt-dii",
};

const JSON_SHAPE =
  '{"title":"","category":"(short English label)","duration":"(e.g. 3 min)","content":""}';

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
JSON shape: ${JSON_SHAPE}`;
  }

  if (language === "th") {
    return `Write a CEFR ${level} Thai reading about: "${topic}".
Natural, native-sounding Thai script, about 8-14 sentences, vocabulary and grammar appropriate for ${level}. Do not add romanization or English in the text. Separate paragraphs with \\n.
JSON shape: ${JSON_SHAPE}`;
  }

  return `Write a CEFR ${level} ${LANG_NAME[language]} reading about: "${topic}".
Natural, native-sounding text, 120-180 words, vocabulary and grammar appropriate for ${level}. Separate paragraphs with \\n.
JSON shape: ${JSON_SHAPE}`;
}

// Phase 2: study notes + per-word dictionary for any text
export function buildAnalyzePrompt(content: string, level: string, language: Language) {
  const reading = READING_HINT[language];
  const readingField = reading ? `, reading (${reading})` : "";
  const vocabCount = language === "zh" || language === "th" ? 6 : 5;
  const exampleLang =
    language === "zh" ? "Chinese, same script as the text" : "the same language as the text";

  return `Analyze this ${level} ${LANG_NAME[language]} reading for a learner.

TEXT:
"""
${content}
"""

Return JSON:
- "translation": faithful English translation.
- "vocabulary": ${vocabCount} useful words/phrases taken FROM the text. {word${readingField}, meaning (English), example (a new sentence in ${exampleLang})}.
- "glossary": a dictionary for hover/tap lookups. One entry for EVERY distinct word or fixed phrase in the text (include small function words, skip punctuation and bare numbers). {word (EXACT surface form as written in the text, same script, spelling and accents), ${reading ? "reading, " : ""}meaning (short English gloss, max 6 words, correct for THIS context), base (dictionary form ONLY if it differs from word, otherwise "")}. Keep multi-word fixed phrases as one entry. No duplicates.
- "grammar": 2 patterns that appear in the text. {title, explanation (English), example (quoted from the text)}.${GRAMMAR_HINT[language]}
- "questions": 3 comprehension questions in the same language as the text, 3 options each, "answer" = index 0-2 of the correct option. Vary the correct index.

JSON shape:
{"translation":"",
"vocabulary":[{"word":"",${reading ? '"reading":"",' : ""}"meaning":"","example":""}],
"glossary":[{"word":"",${reading ? '"reading":"",' : ""}"meaning":"","base":""}],
"grammar":[{"title":"","explanation":"","example":""}],
"questions":[{"question":"","options":["","",""],"answer":0}]}`;
}
