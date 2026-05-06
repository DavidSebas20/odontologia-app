"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { patientSchema } from "@/lib/validators/patients";
import type { PatientInput } from "@/lib/validators/patients";

// Verifica que el usuario autenticado tenga rol de staff
async function requireStaffRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "paciente") {
    return { error: "No tienes permisos para realizar esta acción." };
  }

  return { supabase, user, profile };
}

export async function createPatient(input: PatientInput) {
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase, user } = auth;

  // Normalizar campos vacíos a null
  const data = {
    full_name: parsed.data.full_name,
    dob: parsed.data.dob || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
    created_by: user.id,
  };

  const { data: patient, error } = await supabase
    .from("patients")
    .insert(data)
    .select()
    .single();

  if (error) return { error: "No se pudo crear el paciente." };

  revalidatePath("/pacientes");
  redirect(`/pacientes/${patient.id}`);
}

export async function updatePatient(id: string, input: PatientInput) {
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    full_name: parsed.data.full_name,
    dob: parsed.data.dob || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
  };

  const { error } = await supabase.from("patients").update(data).eq("id", id);

  if (error) return { error: "No se pudo actualizar el paciente." };

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  return { success: true };
}

export async function searchPatients(query: string) {
  const auth = await requireStaffRole();
  if ("error" in auth) return { data: [], error: auth.error };

  const { supabase } = auth;

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { data: [], error: "Error al buscar pacientes." };

  return { data: data ?? [], error: null };
}

export async function getPatients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: "Error al cargar pacientes." };
  return { data: data ?? [], error: null };
}

export async function getPatientById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: "Paciente no encontrado." };
  return { data, error: null };
}
