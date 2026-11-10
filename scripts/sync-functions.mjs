// Copies the shared prompt/normalize code into the Supabase function folder so
// the browser fallback and the edge function can never drift apart.
// Run: npm run sync:functions
import { readFileSync, writeFileSync } from "node:fs";

for (const f of ["languages", "types", "prompts", "normalizeLesson"]) {
  const src = readFileSync(`lib/${f}.ts`, "utf8").replace(
    /from "\.\/(\w+)"/g,
    'from "./$1.ts"'
  );
  writeFileSync(
    `supabase/functions/_shared/${f}.ts`,
    `// GENERATED from lib/${f}.ts by scripts/sync-functions.mjs — edit the original.\n${src}`
  );
}
console.log("synced");
