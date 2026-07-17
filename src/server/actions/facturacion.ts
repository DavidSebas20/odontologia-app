"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { facturaSchema, pagoSchema } from "@/lib/validators/facturacion";
import type { FacturaInput, PagoInput } from "@/lib/validators/facturacion";

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

async function requireAdminOrRecepcion() {
  const auth = await requireAuth();
  if (!["admin", "recepcion"].includes(auth.profile.role)) {
    return { error: "No tienes permisos para realizar esta acción." } as const;
  }
  return auth;
}

async function actualizarEstadoFactura(supabase: Awaited<ReturnType<typeof createClient>>, facturaId: string) {
  const { data: factura } = await supabase
    .from("facturas")
    .select("monto_total")
    .eq("id", facturaId)
    .single();

  if (!factura) return;

  const { data: pagos } = await supabase
    .from("pagos")
    .select("monto")
    .eq("factura_id", facturaId);

  const totalPagado = (pagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0);
  const montoTotal = Number(factura.monto_total);

  let estado: string;
  if (totalPagado >= montoTotal) estado = "pagado";
  else if (totalPagado > 0) estado = "parcial";
  else estado = "pendiente";

  await supabase.from("facturas").update({ estado: estado as "pendiente" | "pagado" | "parcial" | "anulado" }).eq("id", facturaId);
}

export async function createFactura(input: FacturaInput): Promise<ActionResult> {
  const parsed = facturaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireAdminOrRecepcion();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const data = {
    patient_id: parsed.data.patient_id,
    tratamiento_id: parsed.data.tratamiento_id || null,
    monto_total: Number(parsed.data.monto_total),
    fecha_emision: parsed.data.fecha_emision,
  };

  const { error } = await supabase.from("facturas").insert(data);

  if (error) return { error: "No se pudo crear la factura." };

  revalidatePath("/facturacion");
  redirect("/facturacion");
}

export async function registerPago(input: PagoInput): Promise<ActionResult> {
  const parsed = pagoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await requireAdminOrRecepcion();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const { error } = await supabase.from("pagos").insert({
    factura_id: parsed.data.factura_id,
    monto: Number(parsed.data.monto),
    metodo_pago: parsed.data.metodo_pago,
    fecha_pago: parsed.data.fecha_pago,
  });

  if (error) return { error: "No se pudo registrar el pago." };

  await actualizarEstadoFactura(supabase, parsed.data.factura_id);
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${parsed.data.factura_id}`);
  return { success: true };
}

export async function anularFactura(id: string): Promise<ActionResult> {
  const auth = await requireAdminOrRecepcion();
  if ("error" in auth) return auth;

  const { supabase } = auth;

  const { error } = await supabase
    .from("facturas")
    .update({ estado: "anulado" })
    .eq("id", id);

  if (error) return { error: "No se pudo anular la factura." };

  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${id}`);
  return { success: true };
}

export async function getFacturas(filters?: { estado?: string }) {
  const supabase = await createClient();

  let query = supabase.from("facturas").select("*");

  if (filters?.estado) query = query.eq("estado", filters.estado as "pendiente" | "pagado" | "parcial" | "anulado");

  const { data: facturas, error } = await query.order("fecha_emision", { ascending: false });

  if (error || !facturas || facturas.length === 0) return [];

  const patientIds = [...new Set(facturas.map((f) => f.patient_id))];
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name")
    .in("id", patientIds);

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p.full_name]));

  return facturas.map((f) => ({
    ...f,
    patient_name: patientMap.get(f.patient_id) ?? "—",
  }));
}

export async function getFacturaById(id: string) {
  const supabase = await createClient();

  const { data: factura, error } = await supabase
    .from("facturas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !factura) return null;

  const [{ data: patient }, { data: pagos }] = await Promise.all([
    supabase.from("patients").select("id, full_name").eq("id", factura.patient_id).single(),
    supabase.from("pagos").select("*").eq("factura_id", id).order("fecha_pago", { ascending: false }),
  ]);

  const totalPagado = (pagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0);

  let tratamientoInfo = null;
  if (factura.tratamiento_id) {
    const { data: t } = await supabase
      .from("tratamientos")
      .select("id, diagnostico, procedimiento_realizado")
      .eq("id", factura.tratamiento_id)
      .single();
    tratamientoInfo = t;
  }

  return {
    ...factura,
    patient_name: patient?.full_name ?? "—",
    pagos: pagos ?? [],
    total_pagado: totalPagado,
    saldo_pendiente: Math.max(0, Number(factura.monto_total) - totalPagado),
    tratamiento_info: tratamientoInfo,
  };
}
