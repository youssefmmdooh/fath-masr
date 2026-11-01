import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase credentials are not configured yet, allow full access for local demo testing
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("placeholder-project");

  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected paths that require authentication
  const isProtectedPath =
    pathname.startsWith("/play") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/teacher");

  // Auth pages (login / register)
  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/play";
    return NextResponse.redirect(url);
  }

  // Check teacher role if accessing /teacher
  if (user && pathname.startsWith("/teacher")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "teacher") {
      const url = request.nextUrl.clone();
      url.pathname = "/play";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
