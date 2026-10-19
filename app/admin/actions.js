"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const isActionState = arg2 instanceof FormData;

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (isActionState) return { error: pesan };
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (error.message === "Invalid login credentials") {
      pesan = "Email atau password salah.";
    }
    if (isActionState) return { error: pesan };
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const isActionState = arg2 instanceof FormData;

  const passwordBaru = formData.get("password_baru")?.toString();
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString();

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Wajib periksa di server bahwa admin sudah login
  if (authError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Silakan login terlebih dahulu."));
  }

  if (!passwordBaru || passwordBaru.length < 8) {
    const pesan = "Password baru minimal 8 karakter.";
    if (isActionState) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  if (passwordBaru !== konfirmasiPassword) {
    const pesan = "Password baru dan konfirmasi password tidak sama.";
    if (isActionState) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    const pesan = `Gagal mengganti password: ${error.message}`;
    if (isActionState) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  const pesanSukses = "Password berhasil diganti.";
  if (isActionState) return { sukses: pesanSukses };
  redirect(`/admin/password?sukses=${encodeURIComponent(pesanSukses)}`);
}
