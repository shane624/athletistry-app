import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { canAddStudent, syncSeats } from "@/lib/billing";

// Public student signup gated by a STUDIO join code: creates the dancer's
// account and links them to that studio in one step.
export async function POST(request: Request) {
  let email = "", password = "", name = "", code = "";
  try {
    const b = await request.json();
    email = (b.email || "").trim().toLowerCase();
    password = (b.password || "").trim();
    name = (b.name || "").trim();
    code = (b.code || "").trim().toUpperCase();
  } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }

  if (!code) return NextResponse.json({ ok: false, error: "Enter your studio code." }, { status: 400 });
  if (!email.includes("@")) return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });

  const admin = createAdminClient();

  const { data: studio } = await admin.from("studios").select("id, name").eq("join_code", code).maybeSingle();
  if (!studio) return NextResponse.json({ ok: false, error: "No studio found for that code. Check it with your teacher." }, { status: 404 });

  // seat gate — free up to 2 dancers, else the studio needs an active subscription
  if (!(await canAddStudent(studio.id))) {
    return NextResponse.json({ ok: false, error: "This studio is full on its free plan. Ask your teacher to add a seat, then try again." }, { status: 402 });
  }

  // find or create the dancer's account
  let userId: string | null = null;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ ok: false, error: "Lookup failed. Try again." }, { status: 500 });
    const existing = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (existing) {
      if (existing.last_sign_in_at) return NextResponse.json({ ok: false, error: "This account already exists. Log in, then join with your code from the Studios page." }, { status: 409 });
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
  const { error: memErr } = await admin.from("studio_members")
    .upsert({ studio_id: studio.id, user_id: userId, role: "student" }, { onConflict: "studio_id,user_id" });
  if (memErr) return NextResponse.json({ ok: false, error: "Account made, but couldn't join the studio. Log in and try your code again." }, { status: 500 });
  await syncSeats(studio.id);

  return NextResponse.json({ ok: true, studioName: studio.name });
}
