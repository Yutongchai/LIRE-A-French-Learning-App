
"use client";

import { useEffect, useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type Lesson = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  content: string;
  translation: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  grammar: { title: string; explanation: string; example: string }[];
  questions: Question[];
};

const starterLessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "L'art de prendre son temps",
    category: "Vie quotidienne",
    level: "B1",
    duration: "5 min",
    content:
      "Dans une société où tout va de plus en plus vite, prendre son temps est devenu un véritable luxe. Beaucoup de personnes ont l'impression de devoir toujours être productives. Pourtant, apprendre à ralentir peut avoir des effets positifs sur notre bien-être. Par exemple, prendre un café sans regarder son téléphone ou se promener dans un parc permet de profiter davantage du moment présent. Il ne s'agit pas de ne rien faire, mais simplement de trouver un meilleur équilibre entre le travail et la vie personnelle.",
    translation:
      "In a society where everything is moving faster and faster, taking one's time has become a real luxury. Many people feel that they always have to be productive. However, learning to slow down can have positive effects on our well-being. For example, having a coffee without looking at one's phone or walking in a park allows us to enjoy the present moment more. It is not about doing nothing, but simply finding a better balance between work and personal life.",
    vocabulary: [
      { word: "un luxe", meaning: "a luxury", example: "Le temps libre est un luxe." },
      { word: "ralentir", meaning: "to slow down", example: "Il faut parfois ralentir." },
      { word: "le bien-être", meaning: "well-being", example: "Le sport améliore le bien-être." },
      { word: "davantage", meaning: "more / further", example: "Je voudrais en apprendre davantage." },
      { word: "un équilibre", meaning: "a balance", example: "Trouver un équilibre est important." },
    ],
    grammar: [
      {
        title: "Devenir + noun / adjective",
        explanation:
          "Devenir means 'to become'. It is commonly followed by a noun or an adjective.",
        example: "Prendre son temps est devenu un luxe.",
      },
      {
        title: "Il ne s'agit pas de...",
        explanation:
          "This expression means 'It is not a question of...' or 'It is not about...'.",
        example: "Il ne s'agit pas de travailler plus.",
      },
    ],
    questions: [
      {
        question: "Pourquoi prendre son temps est-il devenu un luxe ?",
        options: [
          "Parce que les gens sont toujours occupés.",
          "Parce que les cafés sont chers.",
          "Parce que les parcs sont fermés.",
        ],
        answer: 0,
      },
      {
        question: "Quel est l'objectif de ralentir ?",
        options: [
          "Travailler davantage.",
          "Profiter du moment présent.",
          "Éviter toutes les responsabilités.",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Voyager seul : une expérience unique",
    category: "Voyage",
    level: "B1",
    duration: "5 min",
    content:
      "Voyager seul peut sembler intimidant au début, surtout lorsqu'on a l'habitude de partir avec des amis ou sa famille. Cependant, cette expérience permet de mieux se connaître. On peut organiser ses journées comme on le souhaite, découvrir des endroits inattendus et rencontrer des personnes de cultures différentes. Bien sûr, il faut aussi apprendre à résoudre certains problèmes sans l'aide de quelqu'un. Mais avec un peu de préparation, voyager seul peut devenir une expérience enrichissante et inoubliable.",
    translation:
      "Travelling alone can seem intimidating at first, especially when one is used to travelling with friends or family. However, this experience allows us to get to know ourselves better. We can organise our days as we wish, discover unexpected places and meet people from different cultures. Of course, we also have to learn to solve certain problems without someone's help. But with a little preparation, travelling alone can become an enriching and unforgettable experience.",
    vocabulary: [
      { word: "intimidant", meaning: "intimidating", example: "Parler en public peut être intimidant." },
      { word: "avoir l'habitude de", meaning: "to be used to", example: "J'ai l'habitude de voyager." },
      { word: "inattendu", meaning: "unexpected", example: "Nous avons découvert un endroit inattendu." },
      { word: "enrichissant", meaning: "enriching", example: "Cette expérience était enrichissante." },
      { word: "sans l'aide de", meaning: "without the help of", example: "Elle a réussi sans l'aide de personne." },
    ],
    grammar: [
      {
        title: "Avoir l'habitude de + infinitive",
        explanation:
          "Use this expression to describe something you are accustomed to doing.",
        example: "J'ai l'habitude de voyager seule.",
      },
      {
        title: "Permettre de + infinitive",
        explanation:
          "This construction means 'to allow someone to do something'.",
        example: "Voyager permet de découvrir le monde.",
      },
    ],
    questions: [
      {
        question: "Que permet de faire un voyage en solo ?",
        options: [
          "Mieux se connaître.",
          "Éviter toutes les difficultés.",
          "Voyager gratuitement.",
        ],
        answer: 0,
      },
      {
        question: "Que faut-il faire avant de voyager seul ?",
        options: [
          "Ne rien organiser.",
          "Bien se préparer.",
          "Toujours voyager avec sa famille.",
        ],
        answer: 1,
      },
    ],
  },
];

const STORAGE_KEY = "lire-personal-data";

export default function Home() {
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("lesson-1");
  const [showTranslation, setShowTranslation] = useState(false);
  const [revealedWords, setRevealedWords] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [loaded, setLoaded] = useState(false);

  const lessons = [...starterLessons, ...customLessons];
  const activeLesson =
    lessons.find((lesson) => lesson.id === selectedId) ?? lessons[0];

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (data) {
        const parsed = JSON.parse(data);
        setCustomLessons(parsed.customLessons ?? []);
        setCompleted(parsed.completed ?? []);
        setSaved(parsed.saved ?? []);
      }
    } catch {
      console.warn("Could not load LIRE data.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ customLessons, completed, saved })
    );
  }, [customLessons, completed, saved, loaded]);

  function toggleSaved(id: string) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleCompleted(id: string) {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addReading() {
    if (!newTitle.trim() || !newText.trim()) return;

    const lesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: "My reading",
      level: "B1",
      duration: "Custom",
      content: newText.trim(),
      translation: "",
      vocabulary: [],
      grammar: [],
      questions: [],
    };

    setCustomLessons((current) => [...current, lesson]);
    setSelectedId(lesson.id);
    setNewTitle("");
    setNewText("");
    setShowComposer(false);
    setShowTranslation(false);
    setRevealedWords([]);
    setAnswers({});
  }

  function selectLesson(id: string) {
    setSelectedId(id);
    setShowTranslation(false);
    setRevealedWords([]);
    setAnswers({});
    setShowComposer(false);
  }

  if (!activeLesson) return null;

  return (
    <main className="lire-shell">
      <header className="lire-header">
        <div className="lire-header-inner flex items-center justify-between px-6 py-5">
          <div>
            <div className="lire-logo">LIRE.</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#b9a997]">
              A French reading journal
            </div>
          </div>
          <div className="text-sm text-[#c5b9ad]">Mon espace français</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[230px_1fr]">
        <aside className="lire-sidebar space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
              Your space
            </p>
            <div className="rounded-xl border border-[#e8e5dc] bg-white p-4">
              <p className="font-serif text-3xl">
                {completed.length}
                <span className="ml-2 text-sm text-[#99958a]">readings</span>
              </p>
              <p className="mt-1 text-xs text-[#89877e]">Completed</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eeece5]">
                <div
                  className="h-full rounded-full bg-[#71816c]"
                  style={{
                    width: `${Math.min(
                      100,
                      (completed.length / lessons.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
              Reading library
            </p>
            <div className="space-y-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => selectLesson(lesson.id)}
                  className={`lire-library-item w-full px-3 py-3 text-left text-sm transition ${selectedId === lesson.id ? "is-active" : ""
                    }`}
                >
                  <span className="block font-medium">{lesson.title}</span>
                  <span className="mt-1 block text-xs opacity-70">
                    {lesson.level} · {lesson.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99958a]">
              Personal collection
            </p>
            <button
              onClick={() => setShowComposer(true)}
              className="w-full rounded-lg border border-dashed border-[#c9c6ba] px-3 py-3 text-left text-sm text-[#68675e] hover:bg-white"
            >
              + Add your own reading
            </button>
            <p className="mt-3 text-xs text-[#99958a]">
              {saved.length} saved · {customLessons.length} custom readings
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          {showComposer ? (
            <div className="lire-composer mx-auto max-w-2xl">
              <button
                onClick={() => setShowComposer(false)}
                className="mb-6 text-sm text-[#89877e] hover:text-black"
              >
                ← Back to reading
              </button>
              <p className="text-xs uppercase tracking-[0.18em] text-[#89877e]">
                Personal collection
              </p>
              <h1 className="mt-2 font-serif text-3xl">Add a reading</h1>
              <p className="mt-2 text-sm text-[#89877e]">
                Paste a French text you want to study. It will be saved in this
                browser.
              </p>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Reading title"
                className="mt-6 w-full rounded-lg border border-[#e8e5dc] p-3 text-sm outline-none focus:border-[#71816c]"
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Collez votre texte français ici..."
                rows={10}
                className="mt-3 w-full resize-y rounded-lg border border-[#e8e5dc] p-3 text-sm leading-7 outline-none focus:border-[#71816c]"
              />
              <button
                onClick={addReading}
                disabled={!newTitle.trim() || !newText.trim()}
                className="mt-4 rounded-lg bg-[#465642] px-6 py-3 text-sm text-white hover:bg-[#34432f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save reading
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#99958a]">
                    Your French journal
                  </p>
                  <h1 className="mt-2 font-serif text-4xl">
                    Bonjour, let's read.
                  </h1>
                  <p className="mt-2 text-sm text-[#89877e]">
                    A little French, every day.
                  </p>
                </div>
                <button
                  onClick={() => setShowComposer(true)}
                  className="rounded-lg border border-[#dcd9cf] px-4 py-2.5 text-sm hover:bg-white"
                >
                  + New reading
                </button>
              </div>
              <div className="lire-hero mb-8">
                <div className="lire-hero-content">
                  <p className="lire-eyebrow">
                    Your personal French collection
                  </p>

                  <h2 className="lire-display mt-5 text-5xl sm:text-6xl">
                    Explore the
                    <br />
                    art of French.
                  </h2>

                  <p className="lire-hero-description mt-5">
                    Discover language, culture and ideas through carefully
                    selected readings. A new perspective with every lesson.
                  </p>

                  <button
                    onClick={() =>
                      document.getElementById("daily-reading")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="lire-primary-button mt-7"
                  >
                    Explore today's reading
                  </button>

                  <div className="lire-timeline">
                    <div className="lire-timeline-point" />
                    <div className="lire-timeline-point" />
                    <div className="lire-timeline-point" />
                    <div className="lire-timeline-point" />
                  </div>
                </div>
              </div>
              <article id="daily-reading" className="lire-article">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-[#89877e]">
                    <span>{activeLesson.level}</span>
                    <span>·</span>
                    <span>{activeLesson.category}</span>
                    <span>·</span>
                    <span>{activeLesson.duration}</span>
                  </div>
                  <button
                    onClick={() => toggleSaved(activeLesson.id)}
                    className="text-sm text-[#71816c] hover:text-[#34432f]"
                  >
                    {saved.includes(activeLesson.id)
                      ? "★ Saved"
                      : "☆ Save reading"}
                  </button>
                </div>

                <h2 className="mt-7 font-serif text-3xl leading-tight sm:text-4xl">
                  {activeLesson.title}
                </h2>

                <div className="my-7 h-px bg-[#eeece5]" />

                <div className="max-w-3xl whitespace-pre-line font-serif text-lg leading-[2.1] text-[#46453e]">
                  {activeLesson.content}
                </div>

                {activeLesson.translation && (
                  <div className="mt-8 border-t border-[#eeece5] pt-5">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="text-sm font-medium text-[#71816c] hover:underline"
                    >
                      {showTranslation
                        ? "Hide English translation ↑"
                        : "Show English translation ↓"}
                    </button>
                    {showTranslation && (
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#89877e]">
                        {activeLesson.translation}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-10 border-t border-[#eeece5] pt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
                    01 — Vocabulary
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">
                    Mots à retenir
                  </h3>
                  {activeLesson.vocabulary.length ? (
                    <div className="mt-5 divide-y divide-[#eeece5]">
                      {activeLesson.vocabulary.map((item) => (
                        <div
                          key={item.word}
                          className="flex flex-wrap justify-between gap-3 py-4"
                        >
                          <div>
                            <p className="font-medium">{item.word}</p>
                            <p className="mt-1 text-sm italic text-[#89877e]">
                              {item.example}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setRevealedWords((current) =>
                                current.includes(item.word)
                                  ? current.filter((w) => w !== item.word)
                                  : [...current, item.word]
                              )
                            }
                            className="self-center text-sm text-[#71816c]"
                          >
                            {revealedWords.includes(item.word)
                              ? item.meaning
                              : "Reveal meaning"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#89877e]">
                      Add vocabulary notes as you study this reading.
                    </p>
                  )}
                </div>

                <div className="mt-10 border-t border-[#eeece5] pt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
                    02 — Grammar
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">
                    Points de grammaire
                  </h3>
                  {activeLesson.grammar.length ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {activeLesson.grammar.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-lg bg-[#f8f7f3] p-5"
                        >
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="mt-3 text-sm leading-6 text-[#77756c]">
                            {item.explanation}
                          </p>
                          <p className="mt-3 font-serif text-sm italic">
                            {item.example}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#89877e]">
                      Grammar notes can be added in a future version.
                    </p>
                  )}
                </div>

                <div className="mt-10 border-t border-[#eeece5] pt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
                    03 — Practice
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">
                    Vérifiez votre compréhension
                  </h3>
                  {activeLesson.questions.length ? (
                    <div className="mt-6 space-y-8">
                      {activeLesson.questions.map((question, index) => (
                        <div key={index}>
                          <p className="font-medium">
                            {index + 1}. {question.question}
                          </p>
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optionIndex) => {
                              const selected = answers[index] === optionIndex;
                              const answered = answers[index] !== undefined;
                              const correct =
                                optionIndex === question.answer;

                              return (
                                <button
                                  key={optionIndex}
                                  onClick={() =>
                                    setAnswers((current) => ({
                                      ...current,
                                      [index]: optionIndex,
                                    }))
                                  }
                                  className={`block w-full rounded-lg border p-3 text-left text-sm transition ${selected && correct
                                    ? "border-[#71816c] bg-[#edf1e9]"
                                    : selected && answered
                                      ? "border-[#c77b6c] bg-[#fbefec]"
                                      : answered && correct
                                        ? "border-[#71816c] bg-[#edf1e9]"
                                        : "border-[#e8e5dc] hover:bg-[#f8f7f3]"
                                    }`}
                                >
                                  {option}
                                  {answered && correct && (
                                    <span className="ml-2 text-[#71816c]">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-[#77756c]">
                        Score:{" "}
                        {
                          activeLesson.questions.filter(
                            (q, i) => answers[i] === q.answer
                          ).length
                        }{" "}
                        / {activeLesson.questions.length}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#89877e]">
                      No questions for this custom reading yet.
                    </p>
                  )}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#eeece5] pt-7">
                  <span className="text-sm text-[#89877e]">
                    {completed.includes(activeLesson.id)
                      ? "Reading completed ✓"
                      : "Finished reading?"}
                  </span>
                  <button
                    onClick={() => toggleCompleted(activeLesson.id)}
                    className="rounded-lg bg-[#465642] px-5 py-3 text-sm text-white hover:bg-[#34432f]"
                  >
                    {completed.includes(activeLesson.id)
                      ? "Undo completion"
                      : "Mark as completed"}
                  </button>
                </div>
              </article>

              <p className="mt-5 text-center text-xs text-[#aaa69b]">
                LIRE · Read a little. Learn a little. Every day.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
