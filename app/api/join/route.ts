import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Self-service signup gated by a shared access code. Intended for legacy
// free-group members who aren't in the provisioned list and have no record
// to verify against. The code is posted ONLY inside the Skool community.
//
// SECURITY NOTE: a shared code is weaker than per-member provisioning — if
// it leaks, outsiders can register until you rotate JOIN_CODE. Keep it to
// the community and change it periodically.
export async function POST(request: Request) {
  let email = "";
  let password = "";
  let code = "";
  let name = "";
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
    password = (body.password || "").trim();
    code = (body.code || "").trim();
    name = (body.name || "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // 1) check the shared code
  const expected = process.env.JOIN_CODE;
  if (!expected || code !== expected) {
    return NextResponse.json(
      { ok: false, error: "That access code isn't right. Check the code posted in the Athletistry community." },
      { status: 401 }
    );
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 2) if they already exist, don't clobber an active account
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ ok: false, error: "Lookup failed. Try again." }, { status: 500 });
    const existing = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (existing) {
      if (existing.last_sign_in_at) {
        return NextResponse.json(
          { ok: false, error: "This account already exists. Please log in, or use 'Forgot password'." },
          { status: 409 }
        );
      }
      // exists but never used -> just set the password
      const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password, email_confirm: true,
      });
      if (updErr) return NextResponse.json({ ok: false, error: "Could not set your password." }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    if (data.users.length < 200) break;
  }

  // 3) create the account, already confirmed so they can log in immediately
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name || email.split("@")[0] },
  });
  if (createErr) {
    return NextResponse.json({ ok: false, error: "Could not create your account. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
