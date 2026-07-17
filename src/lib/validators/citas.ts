import { z } from "zod";

export const citaSchema = z.object({
  patient_id: z.string().min(1, "Selecciona un paciente"),
  dentist_id: z.string().min(1, "Selecciona un odontólogo"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora_inicio: z.string().min(1, "La hora de inicio es requerida"),
  hora_fin: z.string().min(1, "La hora de fin es requerida"),
  motivo: z.string().min(1, "El motivo es requerido"),
  notas: z.string().optional().nullable(),
});

export const citaStateSchema = z.object({
  estado: z.enum(["pendiente", "confirmada", "cancelada", "completada"]),
});

export type CitaInput = z.infer<typeof citaSchema>;
export type CitaStateInput = z.infer<typeof citaStateSchema>;
