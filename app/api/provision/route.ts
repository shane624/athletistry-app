import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Creates (invites) a member account. Called ONLY by your Zapier Zap when
// someone joins Skool. Protected by a shared secret header so the public
// cannot hit it.
//
// Zapier sends a POST with:
//   header:  x-provision-secret: <PROVISION_SECRET>
//   body:    { "email": "...", "name": "..." }
export async function POST(request: Request) {
  // 1) auth: shared secret
  const secret = request.headers.get("x-provision-secret");
  if (!secret || secret !== process.env.PROVISION_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2) parse
  let email: string | undefined;
  let name: string | undefined;
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
    name = (body.name || "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const redirectTo = `${new URL(request.url).origin}/auth/callback?next=/reset-password`;

  // 3) invite by email — Supabase emails them a link to set their password.
  //    If they already exist, treat as success (idempotent for re-joins).
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: name || email.split("@")[0] },
    redirectTo,
  });

  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return NextResponse.json({ ok: true, note: "Member already had an account" });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
