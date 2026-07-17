import { z } from "zod";

export const consentimientoSchema = z.object({
  patient_id: z.string().min(1, "Selecciona un paciente"),
  tratamiento_id: z.string().optional().nullable(),
  tipo_consentimiento: z.string().min(1, "El tipo es requerido"),
  contenido: z.string().min(1, "El contenido es requerido"),
  firmado: z.boolean().optional(),
  fecha_firma: z.string().optional().nullable(),
});

export type ConsentimientoInput = z.infer<typeof consentimientoSchema>;
