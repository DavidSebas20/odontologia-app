"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tratamientoSchema } from "@/lib/validators/tratamientos";
import type { TratamientoInput } from "@/lib/validators/tratamientos";

type ActionResult = { error: string } | { success: true };

async function requireAuth() {
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
  if (!profile) redirect("/auth/login");
  return { supabase, user, profile };
}

async function requireStaffRole() {
  const auth = await requireAuth();
  if (auth.profile.role === "paciente") {
    return { error: "No tienes permisos para realizar esta acción." } as const;
  }
  return auth;
}

export async function createTratamiento(input: TratamientoInput): Promise<ActionResult> {
  const parsed = tratamientoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    patient_id: parsed.data.patient_id,
    dentist_id: parsed.data.dentist_id,
    cita_id: parsed.data.cita_id || null,
    fecha: parsed.data.fecha,
    diagnostico: parsed.data.diagnostico,
    procedimiento_realizado: parsed.data.procedimiento_realizado,
    observaciones: parsed.data.observaciones || null,
  };

  const { error } = await supabase.from("tratamientos").insert(data);

  if (error) return { error: "No se pudo registrar el tratamiento." };

  revalidatePath(`/pacientes/${parsed.data.patient_id}/historial`);
  redirect(`/pacientes/${parsed.data.patient_id}/historial`);
}

export async function updateTratamiento(
  id: string,
  input: TratamientoInput,
): Promise<ActionResult> {
  const parsed = tratamientoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    patient_id: parsed.data.patient_id,
    dentist_id: parsed.data.dentist_id,
    cita_id: parsed.data.cita_id || null,
    fecha: parsed.data.fecha,
    diagnostico: parsed.data.diagnostico,
    procedimiento_realizado: parsed.data.procedimiento_realizado,
    observaciones: parsed.data.observaciones || null,
  };

  const { error } = await supabase
    .from("tratamientos")
    .update(data)
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el tratamiento." };

  revalidatePath(`/pacientes/${parsed.data.patient_id}/historial`);
  return { success: true };
}

export async function getTratamientosByPatient(patientId: string) {
  const supabase = await createClient();

  const { data: tratamientos, error } = await supabase
    .from("tratamientos")
    .select("*")
    .eq("patient_id", patientId)
    .order("fecha", { ascending: false });

  if (error || !tratamientos || tratamientos.length === 0) return [];

  const dentistIds = [...new Set(tratamientos.map((t) => t.dentist_id))];
  const citaIds = [...new Set(tratamientos.map((t) => t.cita_id).filter(Boolean))] as string[];

  const [{ data: dentists }, { data: citas }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", dentistIds),
    citaIds.length > 0
      ? supabase.from("citas").select("id, fecha, hora_inicio").in("id", citaIds)
      : { data: [] },
  ]);

  const dentistMap = new Map((dentists ?? []).map((d) => [d.id, d.full_name]));
  const citaMap = new Map((citas ?? []).map((c) => [c.id, c]));

  return tratamientos.map((t) => ({
    ...t,
    dentist_name: dentistMap.get(t.dentist_id) ?? "—",
    cita_info: t.cita_id ? citaMap.get(t.cita_id) ?? null : null,
  }));
}

export async function getTratamientoById(id: string) {
  const supabase = await createClient();

  const { data: tratamiento, error } = await supabase
    .from("tratamientos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tratamiento) return null;

  const [{ data: dentist }, { data: patient }, { data: cita }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", tratamiento.dentist_id).single(),
    supabase.from("patients").select("id, full_name").eq("id", tratamiento.patient_id).single(),
    tratamiento.cita_id
      ? supabase.from("citas").select("id, fecha, hora_inicio").eq("id", tratamiento.cita_id).single()
      : { data: null },
  ]);

  return {
    ...tratamiento,
    dentist_name: dentist?.full_name ?? "—",
    patient_name: patient?.full_name ?? "—",
    cita_info: cita ?? null,
  };
}

export async function getCitasByPatientForTratamiento(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("citas")
    .select("id, fecha, hora_inicio, motivo")
    .eq("patient_id", patientId)
    .order("fecha", { ascending: false });

  if (error) return [];
  return data ?? [];
}
