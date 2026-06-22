"use client";

import { useState } from "react";
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setMsg("Passwords don't match."); return; }
    setBusy(true);
    try {
      // the user arrived here with a recovery session set by /auth/callback
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
      </div>
    </main>
  );
}
