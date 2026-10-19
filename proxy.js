import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Proxy (pengganti middleware di Next.js 16) untuk memproteksi rute /admin.
 * Semua rute di bawah /admin (kecuali /admin/login) wajib login.
 */
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = getCleanUrl();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, publishableKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalizedPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  // Proteksi semua rute /admin kecuali /admin/login
  if (normalizedPath.startsWith("/admin") && normalizedPath !== "/admin/login") {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan membuka /admin/login, alihkan ke /admin
  if (normalizedPath === "/admin/login" && user) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

