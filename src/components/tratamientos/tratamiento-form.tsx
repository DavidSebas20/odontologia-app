"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tratamientoSchema,
  type TratamientoInput,
} from "@/lib/validators/tratamientos";
import {
  createTratamiento,
  updateTratamiento,
} from "@/server/actions/tratamientos";
import { getPatients } from "@/server/actions/patients";
import { getDentists } from "@/server/actions/citas";
import { getCitasByPatientForTratamiento } from "@/server/actions/tratamientos";
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

interface TratamientoFormProps {
  tratamiento?: {
    id: string;
    patient_id: string;
    dentist_id: string;
    cita_id: string | null;
    fecha: string;
    diagnostico: string;
    procedimiento_realizado: string;
    observaciones: string | null;
  };
  preselectedPatientId?: string;
}

export default function TratamientoForm({
  tratamiento,
  preselectedPatientId,
}: TratamientoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<
    { id: string; full_name: string | null; email: string }[]
  >([]);
  const [citas, setCitas] = useState<
    { id: string; fecha: string; hora_inicio: string; motivo: string }[]
  >([]);
  const router = useRouter();
  const isEditing = !!tratamiento;

  const form = useForm<TratamientoInput>({
    resolver: zodResolver(tratamientoSchema),
    defaultValues: {
      patient_id: tratamiento?.patient_id ?? preselectedPatientId ?? "",
      dentist_id: tratamiento?.dentist_id ?? "",
      cita_id: tratamiento?.cita_id ?? "",
      fecha: tratamiento?.fecha ?? new Date().toISOString().slice(0, 10),
      diagnostico: tratamiento?.diagnostico ?? "",
      procedimiento_realizado: tratamiento?.procedimiento_realizado ?? "",
      observaciones: tratamiento?.observaciones ?? "",
    },
  });

  useEffect(() => {
    getPatients().then((r) => { if (r.data) setPatients(r.data); });
    getDentists().then((r) => { if (r) setDentists(r); });
  }, []);

  const selectedPatientId = form.watch("patient_id");

  useEffect(() => {
    if (selectedPatientId) {
      getCitasByPatientForTratamiento(selectedPatientId).then(setCitas);
    }
  }, [selectedPatientId]);

  async function onSubmit(values: TratamientoInput) {
    setLoading(true);
    setServerError(null);

    const result = isEditing
      ? await updateTratamiento(tratamiento!.id, values)
      : await createTratamiento(values);

    if ("error" in result && result.error) {
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
            name="cita_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cita (opcional)</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  >
                    <option value="">Sin cita asociada</option>
                    {citas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fecha} - {c.hora_inicio?.slice(0, 5)} ({c.motivo})
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
            name="diagnostico"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Diagnóstico *</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Caries oclusal en pieza 36..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="procedimiento_realizado"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Procedimiento realizado *</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Resina compuesta en pieza 36..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="observaciones"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Indicaciones post-tratamiento, medicación..."
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
                : "Registrando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar tratamiento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
