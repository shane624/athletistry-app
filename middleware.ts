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
  const isPrivate = ["/dashboard", "/programs", "/progress", "/achievements", "/exercises", "/guide", "/build", "/generate", "/ballet", "/workouts", "/warmups", "/my-workouts", "/training-styles", "/start-here", "/settings", "/welcome", "/admin", "/plan", "/load", "/training-science", "/anatomy"].some((p) =>
    path.startsWith(p)
  );

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/programs/:path*", "/progress/:path*", "/achievements/:path*", "/exercises/:path*", "/guide/:path*", "/build/:path*", "/generate/:path*", "/ballet/:path*", "/workouts/:path*", "/warmups/:path*", "/my-workouts/:path*", "/training-styles/:path*", "/training-science/:path*", "/anatomy/:path*", "/start-here/:path*", "/settings/:path*", "/welcome/:path*", "/admin/:path*", "/plan/:path*", "/load/:path*"],
};
