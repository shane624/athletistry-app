import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Refreshes the Supabase session cookie and guards private routes.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = ["/dashboard", "/programs", "/progress", "/achievements", "/exercises", "/guide", "/build", "/generate", "/circuit", "/ballet", "/workouts", "/warmups", "/my-workouts", "/menu", "/onboarding", "/training-styles", "/start-here", "/settings", "/profile", "/welcome", "/admin", "/plan", "/load", "/training-science", "/anatomy", "/explore", "/movement-map", "/tools"].some((p) =>
    path.startsWith(p)
  );

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Membership gate. Only accounts created through the paid signup carry the
  // server-set `requires_membership` flag; Skool, studio and legacy accounts
  // don't, so they're never affected. Settings stays reachable (sign out).
  if (isPrivate && user && user.app_metadata?.requires_membership && !path.startsWith("/settings")) {
    const { data: profile } = await supabase
      .from("profiles").select("subscription_status").eq("id", user.id).maybeSingle();
    const status = (profile as { subscription_status?: string } | null)?.subscription_status ?? "none";
    if (!["active", "trialing", "past_due"].includes(status)) {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.search = "?required=1";
      return NextResponse.redirect(url);
    }
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/programs/:path*", "/progress/:path*", "/achievements/:path*", "/exercises/:path*", "/guide/:path*", "/build/:path*", "/generate/:path*", "/circuit/:path*", "/menu/:path*", "/onboarding/:path*", "/ballet/:path*", "/workouts/:path*", "/warmups/:path*", "/my-workouts/:path*", "/training-styles/:path*", "/training-science/:path*", "/anatomy/:path*", "/start-here/:path*", "/settings/:path*", "/profile/:path*", "/welcome/:path*", "/admin/:path*", "/plan/:path*", "/load/:path*", "/explore/:path*", "/movement-map/:path*", "/tools/:path*"],
};
