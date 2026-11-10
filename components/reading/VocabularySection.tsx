"use client";

import { useState } from "react";
import type { VocabItem } from "@/lib/types";

export default function VocabularySection({ items, title }: { items: VocabItem[]; title: string }) {
    const [revealed, setRevealed] = useState<string[]>([]);

    const toggle = (word: string) =>
        setRevealed((cur) =>
            cur.includes(word) ? cur.filter((w) => w !== word) : [...cur, word]
        );

    return (
        <div className="mt-10 border-t border-[#eeece5] pt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
                01 — Vocabulary
            </p>
            <h3 className="mt-2 font-serif text-2xl">{title}</h3>
            {items.length ? (
                <div className="mt-5 divide-y divide-[#eeece5]">
                    {items.map((item) => (
                        <div
                            key={item.word}
                            className="flex flex-wrap justify-between gap-3 py-4"
                        >
                            <div>
                                <p className="font-medium">
                                    {item.word}
                                    {item.pinyin && (
                                        <span className="ml-2 text-sm font-normal text-[#9a7950]">{item.pinyin}</span>
                                    )}
                                </p>
                                <p className="mt-1 text-sm italic text-[#89877e]">
                                    {item.example}
                                </p>
                            </div>
                            <button
                                onClick={() => toggle(item.word)}
                                className="self-center text-sm text-[#71816c]"
                            >
                                {revealed.includes(item.word) ? item.meaning : "Reveal meaning"}
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
    );
}