"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false); // do we have a recovery session?
  const [checking, setChecking] = useState(true);

  // Establish the recovery session from whatever the email link delivered.
  // Handles all three formats Supabase can use:
  //   1. #access_token=...&type=recovery   (hash fragment, implicit)
  //   2. ?token_hash=...&type=recovery     (verifyOtp)
  //   3. ?code=...                         (PKCE)
  // Also listens for the PASSWORD_RECOVERY auth event.
  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        if (!cancelled) { setReady(true); setChecking(false); }
      }
    });

    (async () => {
      // already have a session? (hash-fragment links are consumed automatically)
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) { if (!cancelled) { setReady(true); setChecking(false); } return; }

      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");
      const code = url.searchParams.get("code");

      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash: tokenHash });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
      } catch {
        /* fall through — we'll show the "link expired" message below */
      }

      // re-check after attempting to consume the token
      const { data: after } = await supabase.auth.getSession();
      if (!cancelled) {
        setReady(!!after.session);
        setChecking(false);
      }
    })();

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setMsg("Passwords don't match."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setMsg("Password updated. Redirecting…");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1400);
    } catch (err: any) {
      setMsg(err.message ?? "Could not update password. Try the reset link again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">Set a new password</h1>

        {checking && (
          <p className="text-sm text-grey mt-6 text-center">Verifying your reset link…</p>
        )}

        {!checking && !ready && (
          <div className="mt-6 text-center">
            <p className="text-sm text-grey">
              This reset link has expired or was already used. Reset links can only be opened once.
            </p>
            <a href="/login" className="btn-primary inline-block mt-4">Request a new link</a>
          </div>
        )}

        {!checking && ready && (
          <>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input className="input" type="password" placeholder="New password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <input className="input" type="password" placeholder="Confirm new password" required minLength={6}
                value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <button className="btn-primary w-full" disabled={busy || done}>
                {busy ? "…" : "Update password"}
              </button>
            </form>
            {msg && <p className="text-sm text-grey mt-3 text-center">{msg}</p>}
          </>
        )}
      </div>
    </main>
  );
}
