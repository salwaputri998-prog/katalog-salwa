import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Koneksi server untuk pengunjung.
 * Menggunakan SUPABASE_SECRET_KEY untuk membaca data katalog dan detail produk
 * di sisi server.
 */
export function createServerClient() {
  const url = getCleanUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Koneksi sesi admin menggunakan cookies (@supabase/ssr).
 * Menggunakan SUPABASE_PUBLISHABLE_KEY untuk autentikasi dan operasi admin.
 */
export async function createSessionClient() {
  const url = getCleanUrl();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  const cookieStore = await cookies();

  return createSsrServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Diabaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}
