import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateJSON(prompt: string, maxOutputTokens: number) {
  const res = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens,
    },
  });
  const cleaned = (res.text ?? "").replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}