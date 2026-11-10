import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** false until the two public env vars are set -> app keeps its bring-your-own-key mode */
export const cloudEnabled = Boolean(url && anon);

// the anon key is public by design; Row Level Security protects the data
export const supabase = cloudEnabled ? createClient(url!, anon!) : null;

export const AUTH_PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "google,azure")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);
