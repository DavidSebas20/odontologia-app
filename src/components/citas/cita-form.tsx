"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { citaSchema, type CitaInput } from "@/lib/validators/citas";
import { createCita, updateCita } from "@/server/actions/citas";
import { getPatients } from "@/server/actions/patients";
import { getDentists } from "@/server/actions/citas";
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

interface CitaFormProps {
  cita?: {
    id: string;
    patient_id: string;
    dentist_id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    motivo: string;
    estado: string;
    notas: string | null;
  };
}

export default function CitaForm({ cita }: CitaFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<
    { id: string; full_name: string | null; email: string }[]
  >([]);
  const router = useRouter();
  const isEditing = !!cita;

  const form = useForm<CitaInput>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      patient_id: cita?.patient_id ?? "",
      dentist_id: cita?.dentist_id ?? "",
      fecha: cita?.fecha ?? "",
      hora_inicio: cita?.hora_inicio?.slice(0, 5) ?? "",
      hora_fin: cita?.hora_fin?.slice(0, 5) ?? "",
      motivo: cita?.motivo ?? "",
      notas: cita?.notas ?? "",
    },
  });

  useEffect(() => {
    getPatients().then((r) => { if (r.data) setPatients(r.data); });
    getDentists().then((r) => { if (r) setDentists(r); });
  }, []);

  async function onSubmit(values: CitaInput) {
    setLoading(true);
    setServerError(null);

    const result = (isEditing
      ? await updateCita(cita!.id, values)
      : await createCita(values)) as { error?: string; data?: unknown } | undefined;

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
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente *</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Seleccionar paciente...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dentist_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Odontólogo *</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Seleccionar odontólogo...</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name ?? d.email}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hora_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora inicio *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hora_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora fin *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo *</FormLabel>
                <FormControl>
                  <Input placeholder="Revisión general" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Indicaciones previas a la cita..."
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
                : "Crear cita"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
