"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loginAction(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "Credenciales incorrectas. Verifica tu email y contraseña.",
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  email: string,
  password: string,
  full_name: string,
) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Actualizar full_name en profiles (el trigger ya creó la fila)
  if (data.user) {
    await adminClient
      .from("profiles")
      .upsert({ id: data.user.id, email, full_name, role: "paciente" });
  }

  redirect("/auth/login?registered=true");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
