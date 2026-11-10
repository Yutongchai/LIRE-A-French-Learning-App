"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/types";
import { LANGUAGES, type Language } from "@/lib/languages";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { starterLessons } from "@/data/starterLessons";
import { useLireData } from "@/hooks/useLireData";
import Sidebar from "@/components/Sidebar";
import Composer from "@/components/Composer";
import Generator from "@/components/Generator";
import ReadingArticle from "@/components/ReadingArticle";

export default function Home() {
  const {
    customLessons,
    completed,
    saved,
    readLog,
    addLesson,
    analyzeLesson,
    toggleSaved,
    toggleCompleted,
  } = useLireData();

  const [language, setLanguage] = useState<Language>("fr");
  const [selectedId, setSelectedId] = useState("lesson-1");
  const [showComposer, setShowComposer] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  const cfg = LANGUAGES[language];
  const lessons = [...starterLessons, ...customLessons].filter(
    (l) => l.language === language
  );
  const activeLesson = lessons.find((l) => l.id === selectedId) ?? lessons[0];

  const completedCount = lessons.filter((l) => completed.includes(l.id)).length;
  const savedCount = lessons.filter((l) => saved.includes(l.id)).length;
  const customCount = customLessons.filter((l) => l.language === language).length;

  function addReading() {
    if (!newTitle.trim() || !newText.trim()) return;

    const lesson: Lesson = {
      id: `custom-${Date.now()}`,
      language,
      title: newTitle.trim(),
      category: "My reading",
      level: cfg.defaultLevel,
      duration: "Custom",
      content: newText.trim(),
      translation: "",
      vocabulary: [],
      grammar: [],
      questions: [],
    };

    addLesson(lesson);
    analyzeLesson(lesson);

    setSelectedId(lesson.id);
    setNewTitle("");
    setNewText("");
    setShowComposer(false);
  }

  function handleGenerated(lesson: Lesson) {
    addLesson(lesson);
    setSelectedId(lesson.id);
    setShowGenerator(false);
  }

  function selectLesson(id: string) {
    setSelectedId(id);
    setShowComposer(false);
    setShowGenerator(false);
  }

  function switchLanguage(l: Language) {
    setLanguage(l);
    setShowComposer(false);
    setShowGenerator(false);
  }

  function openGenerator() {
    setShowComposer(false);
    setShowGenerator(true);
  }

  function openComposer() {
    setShowGenerator(false);
    setShowComposer(true);
  }

  // Same sidebar for desktop and the phone bottom sheet.
  // `close` is passed only from the sheet so it closes after a tap.
  const renderSidebar = (close?: () => void) => (
    <Sidebar
      lessons={lessons}
      selectedId={activeLesson?.id ?? ""}
      completedCount={completedCount}
      savedCount={savedCount}
      customCount={customCount}
      readLog={readLog}
      onSelect={(id) => {
        selectLesson(id);
        close?.();
      }}
      onAdd={() => {
        openComposer();
        close?.();
      }}
      onGenerate={() => {
        openGenerator();
        close?.();
      }}
    />
  );

  return (
    <div className="lire-shell">
      <header className="lire-header">
        <div className="lire-header-inner flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
          <div>
            <div className="lire-logo">LIRE.</div>
            <div className="hidden text-[10px] uppercase tracking-[0.2em] text-[#b9a997] sm:block">
              A reading journal
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLibraryOpen(true)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#f2eee7] lg:hidden"
            >
              Library
            </button>
            <LanguageSwitcher value={language} onChange={switchLanguage} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[300px_1fr] lg:gap-10 lg:py-10">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{renderSidebar()}</div>

        {/* Main content */}
        <section className="min-w-0">
          {showGenerator ? (
            <Generator
              key={language}
              language={language}
              onGenerated={handleGenerated}
              onBack={() => setShowGenerator(false)}
            />
          ) : showComposer ? (
            <Composer
              title={newTitle}
              text={newText}
              placeholder={cfg.composerPlaceholder}
              onTitleChange={setNewTitle}
              onTextChange={setNewText}
              onSave={addReading}
              onBack={() => setShowComposer(false)}
            />
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#99958a]">
                    Your {cfg.label} journal
                  </p>
                  <h1
                    className={`mt-2 text-3xl sm:text-4xl ${
                      language === "zh" ? "font-zh" : "font-serif"
                    }`}
                  >
                    {cfg.headline}
                  </h1>
                  <p className="mt-2 text-sm text-[#89877e]">{cfg.tagline}</p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    onClick={openGenerator}
                    className="flex-1 rounded-lg bg-[#d99caf] px-4 py-2.5 text-sm font-medium text-[#302528] hover:bg-[#e7b4c4] sm:flex-none"
                  >
                    ✦ Generate
                  </button>
                  <button
                    onClick={openComposer}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-sm text-[#f2eee7] hover:bg-white/5 sm:flex-none"
                  >
                    + New reading
                  </button>
                </div>
              </div>

              {activeLesson ? (
                <ReadingArticle
                  key={activeLesson.id}
                  lesson={activeLesson}
                  isSaved={saved.includes(activeLesson.id)}
                  isCompleted={completed.includes(activeLesson.id)}
                  onToggleSaved={() => toggleSaved(activeLesson.id)}
                  onAnalyze={() => analyzeLesson(activeLesson)}
                  onToggleCompleted={() => toggleCompleted(activeLesson.id)}
                />
              ) : (
                <div className="lire-composer mx-auto max-w-2xl text-center">
                  <p className="font-serif text-2xl">No {cfg.label} readings yet</p>
                  <p className="mt-2 text-sm text-[#aaa19a]">
                    Generate one with AI or paste your own text.
                  </p>
                  <button onClick={openGenerator} className="lire-primary-button mt-6">
                    ✦ Generate a reading
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Phone library bottom sheet */}
      {libraryOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setLibraryOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-[#292625] p-5 pb-8">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            {renderSidebar(() => setLibraryOpen(false))}
          </div>
        </div>
      )}
    </div>
  );
}