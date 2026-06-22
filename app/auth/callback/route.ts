import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Handles the redirect from Supabase email links (sign-up confirmation,
// magic link, and password recovery). Exchanges the code for a session,
// then sends the user to the right next page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // "next" lets recovery links land on the reset-password page
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // something went wrong — send them to login with a flag
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
