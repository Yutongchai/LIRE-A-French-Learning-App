import { NextResponse } from "next/server";
import { buildContentPrompt } from "@/lib/prompts";
import { LANGUAGES, parseLanguage, type Script } from "@/lib/languages";
import { normalizeContent } from "@/lib/normalizeLesson";
import { generateJSON } from "@/lib/gemini";

export async function POST(req: Request) {
  let body: { topic?: string; level?: string; language?: string; script?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const topic = body.topic?.trim().slice(0, 200);
const language = parseLanguage(body.language);  const script: Script = body.script === "simplified" ? "simplified" : "traditional";
  const level = body.level ?? "";

  if (!topic || !LANGUAGES[language].levels.includes(level)) {
    return NextResponse.json({ error: "Topic and valid level required" }, { status: 400 });
  }

  try {
    const raw = await generateJSON(buildContentPrompt(topic, level, language, script), 2000);
    const lesson = normalizeContent(raw, level, language, script);
    if (!lesson) {
      return NextResponse.json({ error: "Model returned an incomplete reading" }, { status: 502 });
    }
    return NextResponse.json(lesson);
  } catch (err) {
    console.error("generate failed:", err);
    return NextResponse.json({ error: "Generation failed, try again" }, { status: 502 });
  }
}