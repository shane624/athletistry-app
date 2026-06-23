"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// NOTE: open self-signup is intentionally disabled. Accounts are created only
// when someone joins the Skool community (via the provisioning flow). Members
// receive an email link to set their password, then log in here.
export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMsg("If an account exists for that email, a reset link is on its way. Check your inbox.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
          {mode === "login" ? "Member log in" : "Reset your password"}
        </h1>
        {mode === "forgot" && (
          <p className="text-sm text-grey text-center mt-1">Enter your email and we'll send you a reset link.</p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="input" type="email" placeholder="Email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
          {mode === "login" && (
            <input className="input" type="password" placeholder="Password" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Log in" : "Send reset link"}
          </button>
        </form>

        {mode === "login" && (
          <button className="text-sm text-grey mt-3 w-full text-center hover:text-teal"
            onClick={() => { setMsg(null); setMode("forgot"); }}>
            Forgot password? / First time here?
          </button>
        )}
        {mode === "forgot" && (
          <button className="text-sm text-teal mt-3 w-full text-center"
            onClick={() => { setMsg(null); setMode("login"); }}>
            Back to log in
          </button>
        )}

        {msg && <p className="text-sm text-grey mt-3 text-center">{msg}</p>}

        <div className="mt-6 pt-5 border-t border-line text-center">
          <p className="text-sm text-grey">
            Not a member yet? Access is included with the{" "}
            <a href="https://www.skool.com/athletistryproject" className="text-teal" target="_blank" rel="noopener">
              Athletistry community
            </a>. Join there and you'll get an email to set up your login.
          </p>
        </div>
      </div>
    </main>
  );
}
