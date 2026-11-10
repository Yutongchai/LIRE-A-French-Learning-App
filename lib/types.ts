import type { Language, Script } from "./languages";

export type Question = {
    question: string;
    options: string[];
    answer: number;
    title?: string;
};

export type VocabItem = {
    word: string;
    meaning: string;
    example: string;
    /** pinyin / IPA / romanization */
    reading?: string;
    /** legacy field (Chinese pinyin); kept so saved lessons still load */
    pinyin?: string;
    title?: string;
};

/** One entry of the per-word dictionary used for hover / tap tooltips. */
export type GlossaryItem = {
    /** surface form exactly as it appears in the text */
    word: string;
    reading?: string;
    meaning: string;
    /** dictionary form, when the surface form is conjugated/inflected */
    base?: string;
};
export type GrammarItem = { title: string; explanation: string; example: string };

export type Lesson = {
    id: string;
    language: Language;
    script?: Script;
    title: string;
    category: string;
    level: string;
    duration: string;
    content: string;
    pinyin?: string;
    translation: string;
    vocabulary: VocabItem[];
    glossary?: GlossaryItem[];
    grammar: GrammarItem[];
    questions: Question[];
    analysis?: "none" | "pending" | "ready" | "error";
    analysisError?: string;
};

export type Analysis = Pick<
  Lesson,
  "translation" | "pinyin" | "vocabulary" | "glossary" | "grammar" | "questions"
>;