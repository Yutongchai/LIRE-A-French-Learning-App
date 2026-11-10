"use client";

import { useMemo } from "react";
import { pinyin } from "pinyin-pro";

const isHan = (c: string) => /[\u3400-\u9fff]/.test(c);

export default function RubyText({ text, show }: { text: string; show: boolean }) {
  const parts = useMemo(() => {
    const chars = Array.from(text);
    const py = pinyin(text, { type: "array" });
    return chars.map((ch, i) => ({ ch, py: isHan(ch) ? py[i] : "" }));
  }, [text]);

  if (!show) return <>{text}</>;

  return (
    <>
      {parts.map((p, i) =>
        p.py ? (
          <ruby key={i}>
            {p.ch}
            <rt>{p.py}</rt>
          </ruby>
        ) : (
          <span key={i}>{p.ch}</span>
        )
      )}
    </>
  );
}