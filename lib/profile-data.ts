// Server-only profile reads. Plain server module (not "use server"), so it
// can export non-action helpers used directly by server components.
import { createClient } from "@/lib/supabase-server";

/** The member's display name, or "" if none set. Falls back to the email
 *  prefix if a name was never provided. */
export async function getDisplayName(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const fromProfile = (profile?.display_name || "").trim();
  if (fromProfile) return fromProfile;
  // fall back to auth metadata, then email prefix
  const meta = (user.user_metadata?.display_name as string | undefined)?.trim();
  if (meta) return meta;
  return (user.email || "").split("@")[0] || "";
}
