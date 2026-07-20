"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Dots from "@/components/Dots";

// Public student signup gated by a STUDIO code: create an account + join.
export default function StudioJoinPage() {
  const supabase = createClient();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // prefill code from the studio's shared link (?code=...)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (c) setCode(c.toUpperCase());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setMsg("Passwords don't match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/studio/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: code.trim(), name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg(data.error || "Something went wrong."); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) { setMsg("Account created. Head to the login page to sign in."); return; }
      router.push("/welcome");
      router.refresh();
    } catch { setMsg("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">Join your studio</h1>
        <p className="text-sm text-grey text-center mt-2">
          Enter the code from your teacher and create your login. Your studio will be able to see your training.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="input font-mono tracking-widest" type="text" placeholder="Studio code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <input className="input" type="text" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Choose a password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input" type="password" placeholder="Confirm password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? <Dots /> : "Create my login"}</button>
        </form>
        {msg && <p className="text-sm text-grey mt-3 text-center">{msg}</p>}
        <div className="mt-6 pt-5 border-t border-line text-center">
          <p className="text-sm text-grey">Already have a login? <a href="/login" className="text-teal">Log in</a>.</p>
        </div>
      </div>
    </main>
  );
}
