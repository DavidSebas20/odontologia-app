import { z } from "zod";

export const facturaSchema = z.object({
  patient_id: z.string().min(1, "Selecciona un paciente"),
  tratamiento_id: z.string().optional().nullable(),
  monto_total: z.string().min(1, "El monto es requerido"),
  fecha_emision: z.string().min(1, "La fecha es requerida"),
});

export const pagoSchema = z.object({
  factura_id: z.string(),
  monto: z.string().min(1, "El monto es requerido"),
  metodo_pago: z.enum(["efectivo", "tarjeta", "transferencia"]),
  fecha_pago: z.string().min(1, "La fecha es requerida"),
});

export type FacturaInput = z.infer<typeof facturaSchema>;
export type PagoInput = z.infer<typeof pagoSchema>;
