// Runs in the browser. The site is a static export on GitHub Pages, so there is
// no server to hold a secret: each visitor supplies their own Gemini API key,
// which stays in their browser and is sent only to Google.

const MODEL = "gemini-3.5-flash";
const KEY_STORAGE = "lire-gemini-key";

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* private mode etc. — key just won't persist */
  }
}

import { AccessRequiredError } from "./errors";

export class MissingKeyError extends AccessRequiredError {
  constructor() {
    super("Add your Gemini API key (🔑 in the top bar) to use AI features.");
  }
}

export async function generateJSON(
  systemPrompt: string,
  prompt: string,
  maxOutputTokens: number
) {
  const key = getApiKey();
  if (!key) throw new MissingKeyError();

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens },
        }),
      }
    );
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  // Never call res.json() blindly: a non-JSON body is what produced Safari's
  // "The string did not match the expected pattern."
  const bodyText = await res.text();
  let body: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    body = JSON.parse(bodyText);
  } catch {
    /* handled below */
  }

  if (!res.ok) {
    const msg: string = body?.error?.message ?? `Request failed (${res.status})`;
    if (res.status === 400 && /api key/i.test(msg)) {
      throw new Error("Gemini rejected the API key. Check it in 🔑 settings.");
    }
    if (res.status === 429) throw new Error("Rate limit reached — wait a moment and retry.");
    throw new Error(msg.slice(0, 200));
  }

  const parts: { text?: string; thought?: boolean }[] =
    body?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("The AI reply was cut off or malformed — please try again.");
  }
}
