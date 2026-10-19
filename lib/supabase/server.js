import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Membuat koneksi Supabase untuk server (pengunjung).
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

