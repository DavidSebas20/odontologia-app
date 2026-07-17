"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consentimientoSchema,
  type ConsentimientoInput,
} from "@/lib/validators/consentimientos";
import {
  createConsentimiento,
  updateConsentimiento,
} from "@/server/actions/consentimientos";
import { getPatients } from "@/server/actions/patients";
import { getTratamientosByPatient } from "@/server/actions/tratamientos";
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

interface ConsentimientoFormProps {
  consentimiento?: {
    id: string;
    patient_id: string;
    tratamiento_id: string | null;
    tipo_consentimiento: string;
    contenido: string;
    firmado: boolean;
    fecha_firma: string | null;
  };
  preselectedPatientId?: string;
}

export default function ConsentimientoForm({
  consentimiento,
  preselectedPatientId,
}: ConsentimientoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tratamientos, setTratamientos] = useState<
    { id: string; diagnostico: string; fecha: string }[]
  >([]);
  const router = useRouter();
  const isEditing = !!consentimiento;

  const form = useForm<ConsentimientoInput>({
    resolver: zodResolver(consentimientoSchema),
    defaultValues: {
      patient_id: consentimiento?.patient_id ?? preselectedPatientId ?? "",
      tratamiento_id: consentimiento?.tratamiento_id ?? "",
      tipo_consentimiento: consentimiento?.tipo_consentimiento ?? "",
      contenido: consentimiento?.contenido ?? "",
      firmado: consentimiento?.firmado ?? false,
      fecha_firma: consentimiento?.fecha_firma?.slice(0, 10) ?? "",
    },
  });

  useEffect(() => {
    getPatients().then((r) => { if (r.data) setPatients(r.data); });
  }, []);

  const selectedPatientId = form.watch("patient_id");

  useEffect(() => {
    if (selectedPatientId) {
      getTratamientosByPatient(selectedPatientId).then((r) => {
        if (r) setTratamientos(r as typeof tratamientos);
      });
    }
  }, [selectedPatientId]);

  async function onSubmit(values: ConsentimientoInput) {
    setLoading(true);
    setServerError(null);

    const result = isEditing
      ? await updateConsentimiento(consentimiento!.id, values)
      : await createConsentimiento(values);

    if (result && "error" in result) {
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
            name="tratamiento_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tratamiento (opcional)</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  >
                    <option value="">Sin tratamiento asociado</option>
                    {tratamientos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fecha} - {t.diagnostico}
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
            name="tipo_consentimiento"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Tipo de consentimiento *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Consentimiento informado para exodoncia"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contenido"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Contenido del consentimiento *</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                    placeholder="Yo, [nombre del paciente], identificado con..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firmado"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-input"
                  />
                  Firmado por el paciente
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("firmado") && (
            <FormField
              control={form.control}
              name="fecha_firma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de firma</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                : "Crear consentimiento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
