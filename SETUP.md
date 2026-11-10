# Cloud setup (login, shared library, your Gemini key on the server)

Until you do this the site keeps working in **bring-your-own-key** mode.
After it, visitors sign in with Google / Microsoft (/ Apple) and never need a key.

## 1. Create the Supabase project (free)
1. https://supabase.com → New project. Note the **Project URL** and the **anon public key**
   (Project Settings → API).
2. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.

## 2. Deploy the AI function (holds your Gemini key)
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set GEMINI_API_KEY=<your Gemini key>
supabase functions deploy ai --no-verify-jwt
```
After changing `lib/prompts.ts`, `lib/normalizeLesson.ts`, `lib/languages.ts` or `lib/types.ts`
run `npm run sync:functions` and redeploy the function.

**Switches** (Table editor → `app_settings`):
- `ai_enabled` = `false` turns AI off for everybody instantly.
- `daily_limit` = AI calls per user per day (default 10). Re-opening a reading
  someone already generated or analyzed is free and not counted.

## 3. Turn on sign-in providers (Authentication → Providers)
Add your site to **Authentication → URL Configuration**:
- Site URL: `https://<your-github-user>.github.io/LIRE-A-French-Learning-App/`
- Redirect URLs: same URL (and `http://localhost:3000/` for local dev)

For each provider, the callback URL to register is
`https://<project-ref>.supabase.co/auth/v1/callback`.

- **Google**: Google Cloud Console → APIs & Services → Credentials → OAuth client (Web).
  Paste Client ID/Secret into Supabase.
- **Microsoft** (provider "Azure"): Entra ID → App registrations → New (accounts in any
  org directory + personal accounts), add a client secret, paste ID/secret into Supabase,
  and use `https://login.microsoftonline.com/common/v2.0` as the Azure tenant URL.
- **Apple** (needs the paid Apple Developer account, $99/yr): later. Then add `apple`
  to `NEXT_PUBLIC_AUTH_PROVIDERS`.

## 4. Point the site at Supabase
GitHub repo → Settings → Secrets and variables → Actions → **Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_AUTH_PROVIDERS` (optional, default `google,azure`; e.g. `google,azure,apple`)

Re-run the deploy workflow. On first sign-in, readings/progress already stored in that
browser are uploaded to the account once.

## How data is protected
- Row Level Security: everyone can read the shared library; only you can read your
  private readings and progress. Clients cannot write shared readings or usage counters.
- The Gemini key exists only as a Supabase secret.
