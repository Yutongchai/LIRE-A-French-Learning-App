import { NextResponse } from "next/server";
import { buildAnalyzePrompt } from "@/lib/prompts";
import { parseLanguage } from "@/lib/languages";
import { normalizeAnalysis } from "@/lib/normalizeLesson";
import { generateJSON } from "@/lib/gemini";

export async function POST(req: Request) {
  let body: { content?: string; level?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const content = body.content?.trim().slice(0, 6000);
  const language = parseLanguage(body.language);
  const level = (body.level ?? "").slice(0, 20);

  if (!content) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  try {
    const raw = await generateJSON(buildAnalyzePrompt(content, level, language), 4000);
    const analysis = normalizeAnalysis(raw);
    if (!analysis) {
      return NextResponse.json({ error: "Incomplete analysis" }, { status: 502 });
    }
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze failed:", err);
    return NextResponse.json({ error: "Analysis failed, try again" }, { status: 502 });
  }
}