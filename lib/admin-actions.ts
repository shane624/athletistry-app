"use server";

// Server actions the admin UI calls. Each delegates to admin-data, which
// re-checks the caller is the admin before doing anything.
import { disableMember, enableMember } from "@/lib/admin-data";

export async function disableMemberAction(userId: string) {
  return disableMember(userId);
}

export async function enableMemberAction(userId: string) {
  return enableMember(userId);
}
