"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Writes the dancer's LOCAL date (YYYY-MM-DD) to a cookie so the server can use
// it instead of its own UTC clock. Fixes "today" being wrong for non-UTC
// timezones (e.g. Monday in Australia reading as Sunday in UTC). Refreshes once
// if the cookie was missing/stale so server components re-read with the right
// date.
function localISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LocalDateCookie() {
  const router = useRouter();
  useEffect(() => {
    const iso = localISO();
    const existing = document.cookie.split("; ").find((c) => c.startsWith("athl_local_date="))?.split("=")[1];
    // cookie lasts a day; path=/ so all server reads see it
    document.cookie = `athl_local_date=${iso}; path=/; max-age=86400; samesite=lax`;
    if (existing !== iso) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
