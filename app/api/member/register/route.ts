import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Open signup for paying members: create the account, then the client signs in
// and goes straight to Stripe Checkout. No access code — payment is the gate.
export async function POST(request: Request) {
  let email = "", password = "", name = "";
  try {
    const body = await request.json();
    email = String(body.email || "").trim().toLowerCase();
    password = String(body.password || "");
    name = String(body.name || "").trim().slice(0, 80);
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // app_metadata is server-controlled (users can't edit it). Marks this as a
    // paid-signup account, so the app requires an active membership. Skool,
    // studio and legacy accounts don't carry this flag and are never gated.
    app_metadata: { requires_membership: true },
    user_metadata: { display_name: name || email.split("@")[0] },
  });

  if (error) {
    const exists = /already|exists|registered/i.test(error.message || "") || (error as { code?: string }).code === "email_exists";
    if (exists) {
      return NextResponse.json(
        { ok: false, exists: true, error: "You already have an account — log in below and you'll go straight to payment." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: "Could not create your account. Try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
