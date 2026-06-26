"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Dots from "@/components/Dots";

// Self-service "set up your account" page for existing Skool members whose
// accounts were pre-created. They prove membership with the email they
// joined with, set a password, and are logged in — no email link needed.
export default function ClaimPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setMsg("Passwords don't match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Something went wrong. Please try again.");
        return;
      }
      // account is ready — log them straight in
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setMsg("Password set. Please head to the login page to sign in.");
        return;
      }
      router.push("/welcome");
      router.refresh();
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">Set up your app account</h1>
        <p className="text-sm text-grey text-center mt-2">
          Already in the Athletistry community? Enter the email you joined with and choose a
          password to access the training app.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="input" type="email" placeholder="Email you joined Skool with" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Choose a password" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input" type="password" placeholder="Confirm password" required minLength={6}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? <Dots /> : "Create my login"}
          </button>
        </form>

        {msg && <p className="text-sm text-grey mt-3 text-center">{msg}</p>}

        <div className="mt-6 pt-5 border-t border-line text-center">
          <p className="text-sm text-grey">
            Already set up your password? <a href="/login" className="text-teal">Log in here</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
