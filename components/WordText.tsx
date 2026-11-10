"use client";

import { useEffect, useMemo, useState } from "react";
import { pinyin } from "pinyin-pro";
import type { GlossaryItem } from "@/lib/types";
import type { Language } from "@/lib/languages";

const isHan = (c: string) => /[㐀-鿿]/.test(c);
const isLetter = (c: string | undefined) => !!c && /[\p{L}\p{M}\p{N}]/u.test(c);
const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'");

type Segment = { text: string; entry?: GlossaryItem; start: number };
type Active = { start: number; entry: GlossaryItem; rect: DOMRect; pinned: boolean };

/** Word-boundary offsets for languages written without spaces. */
function boundaries(text: string, language: Language): Set<number> | null {
  if (language !== "zh" && language !== "th") return null;
  try {
    const seg = new Intl.Segmenter(language === "zh" ? "zh" : "th", { granularity: "word" });
    const set = new Set<number>([0, text.length]);
    for (const s of seg.segment(text)) set.add(s.index);
    return set;
  } catch {
    return null; // old browser: allow matches anywhere
  }
}

/** Greedy longest-match of glossary entries against the text. */
function segmentText(text: string, glossary: GlossaryItem[], language: Language): Segment[] {
  const map = new Map<string, GlossaryItem>();
  let maxLen = 0;
  for (const g of glossary) {
    const k = norm(g.word);
    if (!k || map.has(k)) continue;
    map.set(k, g);
    maxLen = Math.max(maxLen, g.word.length);
  }

  const spaceless = language === "zh" || language === "th";
  const bounds = boundaries(text, language);
  const startOk = (i: number) =>
    spaceless ? !bounds || bounds.has(i) : i === 0 || !isLetter(text[i - 1]);
  const endOk = (j: number) =>
    spaceless ? !bounds || bounds.has(j) : j === text.length || !isLetter(text[j]);

  const out: Segment[] = [];
  let plain = "";
  let plainStart = 0;
  const flush = () => {
    if (plain) out.push({ text: plain, start: plainStart });
    plain = "";
  };

  let i = 0;
  while (i < text.length) {
    let hit: { len: number; entry: GlossaryItem } | null = null;
    if (map.size && startOk(i)) {
      for (let len = Math.min(maxLen, text.length - i); len >= 1; len--) {
        if (!endOk(i + len)) continue;
        const entry = map.get(norm(text.slice(i, i + len)));
        if (entry) {
          hit = { len, entry };
          break;
        }
      }
    }
    if (hit) {
      flush();
      out.push({ text: text.slice(i, i + hit.len), entry: hit.entry, start: i });
      i += hit.len;
    } else {
      if (!plain) plainStart = i;
      plain += text[i];
      i++;
    }
  }
  flush();
  return out;
}

type Props = {
  text: string;
  language: Language;
  glossary: GlossaryItem[];
  /** zh: pinyin over every character · th: romanization over each known word */
  showReading: boolean;
  readingLabel: string;
};

export default function WordText({ text, language, glossary, showReading, readingLabel }: Props) {
  const [active, setActive] = useState<Active | null>(null);

  const segments = useMemo(() => segmentText(text, glossary, language), [text, glossary, language]);
  const py = useMemo(
    () => (language === "zh" ? pinyin(text, { type: "array" }) : []),
    [text, language]
  );

  // close on outside tap, Escape, scroll, resize
  useEffect(() => {
    if (!active) return;
    const close = () => setActive(null);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(".lire-word, .lire-popover")) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [active]);

  function renderInner(seg: Segment) {
    if (language === "zh" && showReading) {
      return Array.from(seg.text).map((ch, k) => {
        const p = isHan(ch) ? py[seg.start + k] : "";
        return p ? (
          <ruby key={k}>
            {ch}
            <rt>{p}</rt>
          </ruby>
        ) : (
          <span key={k}>{ch}</span>
        );
      });
    }
    if (language === "th" && showReading && seg.entry?.reading) {
      return (
        <ruby>
          {seg.text}
          <rt>{seg.entry.reading}</rt>
        </ruby>
      );
    }
    return seg.text;
  }

  function open(seg: Segment, el: HTMLElement, pinned: boolean) {
    if (!seg.entry) return;
    setActive({ start: seg.start, entry: seg.entry, rect: el.getBoundingClientRect(), pinned });
  }

  return (
    <>
      {segments.map((seg) => {
        if (!seg.entry) {
          // zh: unmatched text still gets pinyin when toggled on
          if (language === "zh" && showReading) {
            return <span key={seg.start}>{renderInner(seg)}</span>;
          }
          return seg.text;
        }
        const isActive = active?.start === seg.start;
        return (
          <span
            key={seg.start}
            role="button"
            tabIndex={0}
            aria-label={`${seg.text}: ${seg.entry.meaning}`}
            className={`lire-word ${isActive ? "is-active" : ""}`}
            onPointerEnter={(e) => e.pointerType === "mouse" && open(seg, e.currentTarget, false)}
            onPointerLeave={(e) =>
              e.pointerType === "mouse" && setActive((a) => (a?.pinned ? a : null))
            }
            onClick={(e) => {
              if (isActive && active?.pinned) setActive(null);
              else open(seg, e.currentTarget, true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(seg, e.currentTarget, true);
              }
            }}
          >
            {renderInner(seg)}
          </span>
        );
      })}

      {active && <Popover active={active} readingLabel={readingLabel} />}
    </>
  );
}

function Popover({ active, readingLabel }: { active: Active; readingLabel: string }) {
  const { entry, rect } = active;
  const vw = typeof window === "undefined" ? 360 : window.innerWidth;
  const vh = typeof window === "undefined" ? 640 : window.innerHeight;
  const width = Math.min(260, vw - 16);
  const left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, vw - width - 8));
  const above = rect.top > 140;
  const style: React.CSSProperties = above
    ? { left, width, bottom: vh - rect.top + 8 }
    : { left, width, top: rect.bottom + 8 };

  return (
    <span className="lire-popover" role="tooltip" style={style}>
      <span className="lire-popover-word">{entry.word}</span>
      {entry.reading && (
        <span className="lire-popover-reading" title={readingLabel}>
          {entry.reading}
        </span>
      )}
      <span className="lire-popover-meaning">{entry.meaning}</span>
      {entry.base && norm(entry.base) !== norm(entry.word) && (
        <span className="lire-popover-base">from: {entry.base}</span>
      )}
    </span>
  );
}
