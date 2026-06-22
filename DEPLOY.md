# Deploy Guide — Athletistry App (Vercel + Supabase)

The project is ready to deploy. Free tier on both services. ~15 minutes once accounts exist.

## Step 1 — Create three accounts (you)
1. **GitHub** — github.com → Sign up.
2. **Supabase** — supabase.com → "Sign in with GitHub".
3. **Vercel** — vercel.com → "Continue with GitHub".

## Step 2 — Push this code to GitHub
In Terminal on your Mac:

```bash
cd ~/Movies/CapCut/athletistry-app-tmp
git init
git add .
git commit -m "Athletistry 24-week training app"
```

Create an empty repo at github.com (New → name it `athletistry-app`, no README), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/athletistry-app.git
git branch -M main
git push -u origin main
```

## Step 3 — Supabase (database)
1. Supabase → New project. Pick a name + database password (save it).
2. When ready, open **SQL editor** → paste & run `supabase/schema.sql`, then `supabase/seed.sql`.
3. **Authentication → Providers**: ensure Email is on. For instant testing, turn off "Confirm email".
4. **Settings → API**: copy the **Project URL** and the **anon public** key.

## Step 4 — Vercel (hosting)
1. Vercel → Add New → Project → import your `athletistry-app` repo.
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
3. Deploy. You'll get a public URL like `athletistry-app.vercel.app`.

## After it's live
- Sign up in the app, go to Settings, set your program start date, then open Today.
- See `ARCHITECTURE.md` for the full design and roadmap (push reminders, Google Calendar sync, coach view).

> When you're ready, I can drive your browser through Steps 3–4 — you just click the
> create / authorize buttons (I won't enter credentials or accept terms for you).
