import { z } from "zod";

export const patientSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  dob: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Teléfono inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const patientUpdateSchema = patientSchema;

export type PatientInput = z.infer<typeof patientSchema>;
