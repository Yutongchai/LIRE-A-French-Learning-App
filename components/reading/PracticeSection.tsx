"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

export default function PracticeSection({
  questions, title
}: {
  questions: Question[];
  title: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="mt-10 border-t border-[#eeece5] pt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
        03 — Practice
      </p>
      <h3 className="mt-2 font-serif text-2xl">{title}</h3>
      {questions.length ? (
        <div className="mt-6 space-y-8">
          {questions.map((q, index) => {
            const answered = answers[index] !== undefined;
            return (
              <div key={index}>
                <p className="font-medium">
                  {index + 1}. {q.question}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;
                    const correct = optionIndex === q.answer;

                    const style =
                      selected && correct
                        ? "border-[#71816c] bg-[#edf1e9]"
                        : selected && answered
                        ? "border-[#c77b6c] bg-[#fbefec]"
                        : answered && correct
                        ? "border-[#71816c] bg-[#edf1e9]"
                        : "border-[#e8e5dc] hover:bg-[#f8f7f3]";

                    return (
                      <button
                        key={optionIndex}
                        onClick={() =>
                          setAnswers((cur) => ({ ...cur, [index]: optionIndex }))
                        }
                        className={`block w-full rounded-lg border p-3 text-left text-sm transition ${style}`}
                      >
                        {option}
                        {answered && correct && (
                          <span className="ml-2 text-[#71816c]">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-sm text-[#77756c]">
            Score: {score} / {questions.length}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#89877e]">
          No questions for this custom reading yet.
        </p>
      )}
    </div>
  );
}