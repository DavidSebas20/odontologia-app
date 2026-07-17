"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { citaSchema, citaStateSchema } from "@/lib/validators/citas";
import type { CitaInput, CitaStateInput } from "@/lib/validators/citas";

type ActionResult<T = void> = { error: string; data?: undefined } | { error?: undefined; data: T };

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

export async function createCita(input: CitaInput): Promise<ActionResult> {
  const parsed = citaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const overlap = await supabase
    .from("citas")
    .select("id")
    .eq("dentist_id", parsed.data.dentist_id)
    .eq("fecha", parsed.data.fecha)
    .neq("estado", "cancelada")
    .lt("hora_inicio", parsed.data.hora_fin)
    .gt("hora_fin", parsed.data.hora_inicio);

  if (overlap.data && overlap.data.length > 0) {
    return { error: "El odontólogo ya tiene una cita en ese horario." };
  }

  const data = {
    patient_id: parsed.data.patient_id,
    dentist_id: parsed.data.dentist_id,
    fecha: parsed.data.fecha,
    hora_inicio: parsed.data.hora_inicio,
    hora_fin: parsed.data.hora_fin,
    motivo: parsed.data.motivo,
    estado: "pendiente" as const,
    notas: parsed.data.notas || null,
  };

  const { data: cita, error } = await supabase
    .from("citas")
    .insert(data)
    .select()
    .single();

  if (error) return { error: "No se pudo crear la cita." };

  revalidatePath("/citas");
  redirect(`/citas/${cita.id}`);
}

export async function updateCita(id: string, input: CitaInput): Promise<ActionResult> {
  const parsed = citaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const overlap = await supabase
    .from("citas")
    .select("id")
    .eq("dentist_id", parsed.data.dentist_id)
    .eq("fecha", parsed.data.fecha)
    .neq("estado", "cancelada")
    .neq("id", id)
    .lt("hora_inicio", parsed.data.hora_fin)
    .gt("hora_fin", parsed.data.hora_inicio);

  if (overlap.data && overlap.data.length > 0) {
    return { error: "El odontólogo ya tiene otra cita en ese horario." };
  }

  const data = {
    patient_id: parsed.data.patient_id,
    dentist_id: parsed.data.dentist_id,
    fecha: parsed.data.fecha,
    hora_inicio: parsed.data.hora_inicio,
    hora_fin: parsed.data.hora_fin,
    motivo: parsed.data.motivo,
    notas: parsed.data.notas || null,
  };

  const { error } = await supabase.from("citas").update(data).eq("id", id);

  if (error) return { error: "No se pudo actualizar la cita." };

  revalidatePath("/citas");
  revalidatePath(`/citas/${id}`);
  return { data: undefined };
}

export async function changeCitaState(id: string, input: CitaStateInput): Promise<ActionResult> {
  const parsed = citaStateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const { error } = await supabase
    .from("citas")
    .update({ estado: parsed.data.estado })
    .eq("id", id);

  if (error) return { error: "No se pudo cambiar el estado." };

  revalidatePath("/citas");
  revalidatePath(`/citas/${id}`);
  return { data: undefined };
}

export async function getCitas(filters?: { fecha?: string; estado?: string }) {
  const supabase = await createClient();

  let query = supabase.from("citas").select("*");

  if (filters?.fecha) query = query.eq("fecha", filters.fecha);
  if (filters?.estado) query = query.eq("estado", filters.estado as "pendiente" | "confirmada" | "cancelada" | "completada");

  const { data: citas, error } = await query
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (error || !citas || citas.length === 0) return [];

  const patientIds = [...new Set(citas.map((c) => c.patient_id))];
  const dentistIds = [...new Set(citas.map((c) => c.dentist_id))];

  const [{ data: patients }, { data: dentists }] = await Promise.all([
    supabase.from("patients").select("id, full_name").in("id", patientIds),
    supabase.from("profiles").select("id, full_name").in("id", dentistIds),
  ]);

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p.full_name]));
  const dentistMap = new Map((dentists ?? []).map((d) => [d.id, d.full_name]));

  return citas.map((c) => ({
    ...c,
    patient_name: patientMap.get(c.patient_id) ?? "—",
    dentist_name: dentistMap.get(c.dentist_id) ?? "—",
  }));
}

export async function getCitaById(id: string) {
  const supabase = await createClient();

  const { data: cita, error } = await supabase
    .from("citas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cita) return null;

  const [{ data: patient }, { data: dentist }] = await Promise.all([
    supabase.from("patients").select("id, full_name").eq("id", cita.patient_id).single(),
    supabase.from("profiles").select("id, full_name").eq("id", cita.dentist_id).single(),
  ]);

  return {
    ...cita,
    patient_name: patient?.full_name ?? "—",
    dentist_name: dentist?.full_name ?? "—",
  };
}

export async function getCitasByPatient(patientId: string) {
  const supabase = await createClient();

  const { data: citas, error } = await supabase
    .from("citas")
    .select("*")
    .eq("patient_id", patientId)
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: false });

  if (error || !citas || citas.length === 0) return [];

  const dentistIds = [...new Set(citas.map((c) => c.dentist_id))];
  const { data: dentists } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", dentistIds);

  const dentistMap = new Map((dentists ?? []).map((d) => [d.id, d.full_name]));

  return citas.map((c) => ({
    ...c,
    dentist_name: dentistMap.get(c.dentist_id) ?? "—",
  }));
}

export async function getDentists() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["dentista", "admin"]);

  if (error) return [];
  return data ?? [];
}
