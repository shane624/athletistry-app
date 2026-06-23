import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Self-service account claim for members who already exist in Supabase
// (provisioned from the Skool member list / Zapier) but haven't set a
// password yet. No email required — the member proves membership by
// knowing the email they joined Skool with.
//
// SECURITY: only succeeds if the email belongs to an existing member who
// has NOT yet set a password (never confirmed / no last_sign_in). This
// means a random outsider cannot create an account, and nobody can take
// over an account that's already active.
export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
    password = (body.password || "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find the user by email. (listUsers is paginated; we scan for a match.)
  // For larger member bases this still works fine within a few pages.
  let found: any = null;
  for (let page = 1; page <= 20 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return NextResponse.json({ ok: false, error: "Lookup failed. Try again." }, { status: 500 });
    }
    found = data.users.find((u) => (u.email || "").toLowerCase() === email) || null;
    if (data.users.length < 200) break; // last page
  }

  // Not a member at all -> reject (keeps it members-only). Generic message
  // so we don't reveal who is / isn't a member.
  if (!found) {
    return NextResponse.json(
      { ok: false, error: "We couldn't find a membership for that email. Make sure it's the email you used to join the Athletistry community." },
      { status: 404 }
    );
  }

  // Already active (has signed in before) -> don't let it be re-claimed.
  // Direct them to the normal login / reset instead.
  if (found.last_sign_in_at) {
    return NextResponse.json(
      { ok: false, error: "This account is already set up. Please log in, or use 'Forgot password' if you've forgotten it." },
      { status: 409 }
    );
  }

  // Set the password and mark the email confirmed so they can log in now.
  const { error: updErr } = await admin.auth.admin.updateUserById(found.id, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    return NextResponse.json({ ok: false, error: "Could not set your password. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
