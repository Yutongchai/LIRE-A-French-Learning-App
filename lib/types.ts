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
    pinyin?: string;
    title?: string;
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
    grammar: GrammarItem[];
    questions: Question[];
    analysis?: "none" | "pending" | "ready" | "error";
};

export type Analysis = Pick<
  Lesson,
  "translation" | "pinyin" | "vocabulary" | "grammar" | "questions"
>;