"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/lib/types";
import VocabularySection from "./reading/VocabularySection";
import GrammarSection from "./reading/GrammarSection";
import PracticeSection from "./reading/PracticeSection";
import { LANGUAGES } from "@/lib/languages";
import WordText from "./WordText";
import ProgressBar from "./ProgressBar";
import type { GlossaryItem } from "@/lib/types";

type Props = {
    lesson: Lesson;
    isSaved: boolean;
    isCompleted: boolean;
    onToggleSaved: () => void;
    onToggleCompleted: () => void;
    onAnalyze: () => void;
    onOpenKey: () => void;
};

export default function ReadingArticle({
    lesson,
    isSaved,
    isCompleted,
    onToggleSaved,
    onToggleCompleted,
    onAnalyze,
    onOpenKey,
}: Props) {
    const status = lesson.analysis ?? (lesson.vocabulary.length ? "ready" : "none");
    const [showTranslation, setShowTranslation] = useState(false);
    const [showPinyin, setShowPinyin] = useState(false);
    const cfg = LANGUAGES[lesson.language];
    const isZh = lesson.language === "zh";
    const isTh = lesson.language === "th";
    const hasReadingToggle = isZh || isTh;

    // glossary first, then vocabulary as a fallback (starter lessons only have vocabulary)
    const glossary = useMemo<GlossaryItem[]>(
        () => [
            ...(lesson.glossary ?? []),
            ...lesson.vocabulary.map((v) => ({
                word: v.word,
                reading: v.reading ?? v.pinyin,
                meaning: v.meaning,
            })),
        ],
        [lesson.glossary, lesson.vocabulary]
    );

    return (
        <article id="daily-reading" className="lire-article">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-[#89877e] sm:text-xs">
                    <span>{lesson.level}</span>
                    <span>·</span>
                    <span>{lesson.category}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{lesson.duration}</span>
                </div>
                <button
                    onClick={onToggleSaved}
                    aria-label={isSaved ? "Saved" : "Save reading"}
                    className="-m-2 shrink-0 p-2 text-lg text-[#71816c] sm:text-sm"
                >
                    {isSaved ? "★" : "☆"}
                    <span className="hidden sm:inline">{isSaved ? " Saved" : " Save reading"}</span>
                </button>
            </div>

            <h2 className="mt-5 font-serif text-2xl leading-snug sm:mt-7 sm:text-4xl">
                {lesson.title}
            </h2>

            <div className="my-5 h-px bg-[#eeece5] sm:my-7" />

            <div
                lang={
                    isZh
                        ? lesson.script === "simplified"
                            ? "zh-Hans"
                            : "zh-Hant"
                        : lesson.language
                }
                className={`max-w-3xl whitespace-pre-line break-words text-[#46453e] ${isZh
                        ? "font-zh text-lg leading-[2.1] sm:text-xl sm:leading-[2.3]"
                        : isTh
                            ? "font-th text-lg leading-[2.1] sm:text-xl sm:leading-[2.2]"
                            : "font-serif text-base leading-[2] sm:text-lg sm:leading-[2.1]"
                    }`}
            >
                <WordText
                    text={lesson.content}
                    language={lesson.language}
                    glossary={glossary}
                    showReading={showPinyin}
                    readingLabel={cfg.readingLabel}
                />
            </div>

            {glossary.length > 0 && (
                <p className="mt-3 text-xs text-[#9a958b]">
                    <span className="hidden sm:inline">Hover</span>
                    <span className="sm:hidden">Tap</span> a{" "}
                    <span className="lire-word-hint">underlined word</span> to see its meaning
                    {lesson.language === "fr" || isZh || isTh ? " and pronunciation" : ""}.
                </p>
            )}

            {hasReadingToggle && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowPinyin(!showPinyin)}
                        className="py-2 text-sm font-medium text-[#71816c] hover:underline"
                    >
                        {showPinyin
                            ? `Hide ${cfg.readingLabel.toLowerCase()} ↑`
                            : `Show ${cfg.readingLabel.toLowerCase()} ↓`}
                    </button>
                </div>
            )}

            {lesson.translation && (
                <div className="mt-6 border-t border-[#eeece5] pt-5">
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className="py-2 text-sm font-medium text-[#71816c] hover:underline"
                    >
                        {showTranslation
                            ? "Hide English translation ↑"
                            : "Show English translation ↓"}
                    </button>
                    {showTranslation && (
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#89877e]">
                            {lesson.translation}
                        </p>
                    )}
                </div>
            )}

            {status === "ready" ? (
                <>
                    <VocabularySection items={lesson.vocabulary} title={cfg.sectionTitles.vocab} />
                    <GrammarSection items={lesson.grammar} title={cfg.sectionTitles.grammar} />
                    <PracticeSection questions={lesson.questions} title={cfg.sectionTitles.practice} />
                </>
            ) : (
                <div className="mt-10 rounded-lg bg-[#f8f7f3] p-5 text-sm text-[#77756c]">
                    {status === "pending" ? (
                        <div>
                            <ProgressBar label="Preparing translation, vocabulary, grammar and word notes…" />
                            <p className="mt-3 text-xs">You can keep reading while this finishes.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="min-w-0 flex-1 basis-60">
                                {status === "error"
                                    ? lesson.analysisError ?? "Analysis failed."
                                    : "No study notes yet."}
                            </span>
                            <div className="flex w-full gap-2 sm:w-auto">
                                {status === "error" && /API key/i.test(lesson.analysisError ?? "") && (
                                    <button
                                        onClick={onOpenKey}
                                        className="flex-1 rounded-lg border border-[#465642] px-4 py-2 text-[#465642] sm:flex-none"
                                    >
                                        Set API key
                                    </button>
                                )}
                                <button
                                    onClick={onAnalyze}
                                    className="flex-1 rounded-lg bg-[#465642] px-4 py-2 text-white hover:bg-[#34432f] sm:flex-none"
                                >
                                    {status === "error" ? "Retry" : "Analyze this reading"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-[#eeece5] pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#89877e]">
                    {isCompleted ? "Reading completed ✓" : "Finished reading?"}
                </span>
                <button
                    onClick={onToggleCompleted}
                    className="w-full rounded-lg bg-[#465642] px-5 py-3.5 text-sm text-white hover:bg-[#34432f] sm:w-auto"
                >
                    {isCompleted ? "Undo completion" : "Mark as completed"}
                </button>
            </div>
        </article>
    );
}