"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { consentimientoSchema } from "@/lib/validators/consentimientos";
import type { ConsentimientoInput } from "@/lib/validators/consentimientos";

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

export async function createConsentimiento(
  input: ConsentimientoInput,
): Promise<ActionResult> {
  const parsed = consentimientoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    patient_id: parsed.data.patient_id,
    tratamiento_id: parsed.data.tratamiento_id || null,
    tipo_consentimiento: parsed.data.tipo_consentimiento,
    contenido: parsed.data.contenido,
    firmado: parsed.data.firmado ?? false,
    fecha_firma: parsed.data.firmado && parsed.data.fecha_firma
      ? parsed.data.fecha_firma
      : null,
  };

  const { error } = await supabase.from("consentimientos").insert(data);

  if (error) return { error: "No se pudo crear el consentimiento." };

  revalidatePath(`/pacientes/${parsed.data.patient_id}/consentimientos`);
  redirect(`/pacientes/${parsed.data.patient_id}/consentimientos`);
}

export async function updateConsentimiento(
  id: string,
  input: ConsentimientoInput,
): Promise<ActionResult> {
  const parsed = consentimientoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    patient_id: parsed.data.patient_id,
    tratamiento_id: parsed.data.tratamiento_id || null,
    tipo_consentimiento: parsed.data.tipo_consentimiento,
    contenido: parsed.data.contenido,
    firmado: parsed.data.firmado ?? false,
    fecha_firma: parsed.data.firmado && parsed.data.fecha_firma
      ? parsed.data.fecha_firma
      : null,
  };

  const { error } = await supabase
    .from("consentimientos")
    .update(data)
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el consentimiento." };

  revalidatePath(`/pacientes/${parsed.data.patient_id}/consentimientos`);
  return { success: true };
}

export async function firmarConsentimiento(id: string): Promise<ActionResult> {
  const auth = await requireStaffRole();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const { error } = await supabase
    .from("consentimientos")
    .update({
      firmado: true,
      fecha_firma: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "No se pudo firmar el consentimiento." };

  revalidatePath("/pacientes");
  return { success: true };
}

export async function getConsentimientosByPatient(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consentimientos")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getConsentimientoById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consentimientos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name")
    .eq("id", data.patient_id)
    .single();

  return { ...data, patient_name: patient?.full_name ?? "—" };
}
