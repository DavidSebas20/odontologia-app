import { z } from "zod";

export const tratamientoSchema = z.object({
  patient_id: z.string().min(1, "Selecciona un paciente"),
  dentist_id: z.string().min(1, "Selecciona un odontólogo"),
  cita_id: z.string().optional().nullable(),
  fecha: z.string().min(1, "La fecha es requerida"),
  diagnostico: z.string().min(1, "El diagnóstico es requerido"),
  procedimiento_realizado: z
    .string()
    .min(1, "El procedimiento es requerido"),
  observaciones: z.string().optional().nullable(),
});

export type TratamientoInput = z.infer<typeof tratamientoSchema>;
