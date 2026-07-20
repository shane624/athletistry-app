import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public studio-owner signup: creates an account AND a studio in one step.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(len = 6): string {
  let s = ""; for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export async function POST(request: Request) {
  let email = "", password = "", name = "", studioName = "";
  try {
    const b = await request.json();
    email = (b.email || "").trim().toLowerCase();
    password = (b.password || "").trim();
    name = (b.name || "").trim();
    studioName = (b.studioName || "").trim();
  } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }

  if (!email.includes("@")) return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  if (!studioName) return NextResponse.json({ ok: false, error: "Please name your studio." }, { status: 400 });

  const admin = createAdminClient();

  // find or create the owner account (don't clobber an active one)
  let userId: string | null = null;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ ok: false, error: "Lookup failed. Try again." }, { status: 500 });
    const existing = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (existing) {
      if (existing.last_sign_in_at) return NextResponse.json({ ok: false, error: "This account already exists. Log in, then create a studio from the Studios page." }, { status: 409 });
      const { error: upd } = await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
      if (upd) return NextResponse.json({ ok: false, error: "Could not set your password." }, { status: 500 });
      userId = existing.id; break;
    }
    if (data.users.length < 200) break;
  }
  if (!userId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { display_name: name || email.split("@")[0] },
    });
    if (createErr || !created.user) return NextResponse.json({ ok: false, error: "Could not create your account." }, { status: 500 });
    userId = created.user.id;
  }

  await admin.from("profiles").upsert({ id: userId, display_name: name || email.split("@")[0] }, { onConflict: "id" });

  // one studio per account
  const { data: alreadyOwns } = await admin.from("studios").select("id").eq("owner_id", userId).maybeSingle();
  if (alreadyOwns) return NextResponse.json({ ok: false, error: "This email already runs a studio. Log in to manage it." }, { status: 409 });

  // unique join code + studio
  let code = genCode();
  for (let i = 0; i < 8; i++) { const { data } = await admin.from("studios").select("id").eq("join_code", code).maybeSingle(); if (!data) break; code = genCode(); }
  const { data: studio, error: sErr } = await admin.from("studios")
    .insert({ owner_id: userId, name: studioName.slice(0, 80), join_code: code }).select("id, join_code").single();
  if (sErr || !studio) return NextResponse.json({ ok: false, error: "Account made, but the studio couldn't be created. Log in and try from the Studios page." }, { status: 500 });

  return NextResponse.json({ ok: true, studioId: studio.id, code: studio.join_code });
}
