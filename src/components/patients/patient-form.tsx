"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientInput } from "@/lib/validators/patients";
import { createPatient, updatePatient } from "@/server/actions/patients";
import type { Patient } from "@/types/database";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PatientFormProps {
  patient?: Patient;
}

export default function PatientForm({ patient }: PatientFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!patient;

  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: patient?.full_name ?? "",
      dob: patient?.dob ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      address: patient?.address ?? "",
      notes: patient?.notes ?? "",
    },
  });

  async function onSubmit(values: PatientInput) {
    setLoading(true);
    setServerError(null);

    const result = (
      isEditing
        ? await updatePatient(patient!.id, values)
        : await createPatient(values)
    ) as { error?: string } | undefined;

    if (result?.error) {
      setServerError(result.error);
      setLoading(false);
      return;
    }

    if (isEditing) router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Nombre completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ana García López" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0987654321"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ana@email.com"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Calle Principal N-30 y Calle Secundaria, Quito"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notas adicionales</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Alergias, condiciones especiales, etc."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing
                ? "Guardando..."
                : "Creando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear paciente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
