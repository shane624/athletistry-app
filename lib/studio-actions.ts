"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { canAddStudent, syncSeats } from "@/lib/billing";

// Unambiguous code alphabet (no O/0/I/1).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(len = 6): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}
async function uniqueCode(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = genCode();
    const { data } = await admin.from("studios").select("id").eq("join_code", code).maybeSingle();
    if (!data) return code;
  }
  return genCode(8);
}

async function me() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Owner guard for a studio. Returns the admin client, or null if not the owner. */
async function asOwner(studioId: string) {
  const user = await me();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("studios").select("owner_id").eq("id", studioId).maybeSingle();
  if (!data || data.owner_id !== user.id) return null;
  return admin;
}

/** Create a studio (self-serve). Caller becomes the owner. */
export async function createStudio(name: string): Promise<{ ok: boolean; id?: string; code?: string; error?: string }> {
  const user = await me();
  if (!user) return { ok: false, error: "Please sign in first." };
  const admin = createAdminClient();
  const code = await uniqueCode(admin);
  const clean = (name || "").trim().slice(0, 80) || "My Studio";
  const { data, error } = await admin.from("studios")
    .insert({ owner_id: user.id, name: clean, join_code: code }).select("id, join_code").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id, code: data.join_code };
}

/** Join a studio by its code. This links the caller's account as a student. */
export async function joinStudio(code: string): Promise<{ ok: boolean; studioId?: string; studioName?: string; error?: string }> {
  const user = await me();
  if (!user) return { ok: false, error: "Please sign in first." };
  const admin = createAdminClient();
  const clean = (code || "").trim().toUpperCase();
  if (!clean) return { ok: false, error: "Enter a studio code." };
  const { data: studio } = await admin.from("studios").select("id, name").eq("join_code", clean).maybeSingle();
  if (!studio) return { ok: false, error: "No studio found for that code." };

  // Seat gate — free up to 2 dancers, then the studio needs an active subscription.
  const { data: existing } = await admin.from("studio_members")
    .select("user_id").eq("studio_id", studio.id).eq("user_id", user.id).maybeSingle();
  if (!existing && !(await canAddStudent(studio.id))) {
    return { ok: false, error: "This studio is full on the free plan (2 dancers). Ask them to add a seat, then try again." };
  }

  const { error } = await admin.from("studio_members")
    .upsert({ studio_id: studio.id, user_id: user.id, role: "student" }, { onConflict: "studio_id,user_id" });
  if (error) return { ok: false, error: error.message };
  await syncSeats(studio.id);
  return { ok: true, studioId: studio.id, studioName: studio.name };
}

/** Leave a studio (student removes their own membership). */
export async function leaveStudio(studioId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await me();
  if (!user) return { ok: false, error: "Please sign in first." };
  const supabase = createClient();
  const { error } = await supabase.from("studio_members").delete().eq("studio_id", studioId).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  await syncSeats(studioId);
  return { ok: true };
}

/** Owner: generate a fresh join code (old links stop working). */
export async function regenerateCode(studioId: string): Promise<{ ok: boolean; code?: string; error?: string }> {
  const admin = await asOwner(studioId);
  if (!admin) return { ok: false, error: "Not authorized." };
  const code = await uniqueCode(admin);
  const { error } = await admin.from("studios").update({ join_code: code }).eq("id", studioId);
  return error ? { ok: false, error: error.message } : { ok: true, code };
}

/** Owner: rename the studio. */
export async function renameStudio(studioId: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await asOwner(studioId);
  if (!admin) return { ok: false, error: "Not authorized." };
  const clean = (name || "").trim().slice(0, 80);
  if (!clean) return { ok: false, error: "Enter a name." };
  const { error } = await admin.from("studios").update({ name: clean }).eq("id", studioId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Owner: remove a student from the roster (does not delete their account/data). */
export async function removeStudent(studioId: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await asOwner(studioId);
  if (!admin) return { ok: false, error: "Not authorized." };
  const { error } = await admin.from("studio_members").delete().eq("studio_id", studioId).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  await syncSeats(studioId);
  return { ok: true };
}

/** Owner: delete the studio entirely (roster links removed; student data untouched). */
export async function deleteStudio(studioId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await asOwner(studioId);
  if (!admin) return { ok: false, error: "Not authorized." };
  const { error } = await admin.from("studios").delete().eq("id", studioId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
