import { createClient } from "@/lib/supabase-server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Handles the redirect from Supabase email links (sign-up confirmation,
// magic link, invite, and password recovery). Supports BOTH link formats:
//   - PKCE:        ?code=...            -> exchangeCodeForSession
//   - Token hash:  ?token_hash=&type=  -> verifyOtp  (default recovery/invite links)
// Then sends the user to the right next page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  // "next" lets recovery/invite links land on the reset-password page
  const next = url.searchParams.get("next") ?? "/dashboard";

  const supabase = createClient();

  // Token-hash flow (Supabase default for recovery, invite, signup confirm)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // PKCE flow (?code=)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // something went wrong — send them to login with a flag
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
