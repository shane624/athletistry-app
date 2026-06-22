"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        setMsg("Account created. If email confirmation is on, check your inbox — otherwise you're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setMsg(err.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input className="input" placeholder="Display name" value={name}
              onChange={(e) => setName(e.target.value)} />
          )}
          <input className="input" type="email" placeholder="Email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {msg && <p className="text-sm text-grey mt-3">{msg}</p>}

        <button
          className="text-sm text-teal mt-4 w-full text-center"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
