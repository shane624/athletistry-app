"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Dots from "@/components/Dots";

// Public studio-owner signup: create an account + a studio in one step.
export default function CreateStudioPage() {
  const supabase = createClient();
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [name, setName] = useState("");
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
      const res = await fetch("/api/studio/owner-register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ studioName: studioName.trim(), name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg(data.error || "Something went wrong."); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) { setMsg("Studio created. Head to the login page to sign in."); return; }
      router.push(`/studio/${data.studioId}`);
      router.refresh();
    } catch { setMsg("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">Create a studio</h1>
        <p className="text-sm text-grey text-center mt-2">
          Set up your studio account and you&apos;ll get a code to share with your dancers. Free for your first 2 dancers.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="input" type="text" placeholder="Studio name" required value={studioName} onChange={(e) => setStudioName(e.target.value)} />
          <input className="input" type="text" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Choose a password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input" type="password" placeholder="Confirm password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? <Dots /> : "Create studio"}</button>
        </form>
        {msg && <p className="text-sm text-grey mt-3 text-center">{msg}</p>}
        <div className="mt-6 pt-5 border-t border-line text-center space-y-1">
          <p className="text-sm text-grey">Have a studio code? <a href="/studio/join" className="text-teal">Join as a dancer</a>.</p>
          <p className="text-sm text-grey">Already have a login? <a href="/login" className="text-teal">Log in</a>.</p>
        </div>
      </div>
    </main>
  );
}
