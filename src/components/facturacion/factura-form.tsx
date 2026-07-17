"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { facturaSchema, type FacturaInput } from "@/lib/validators/facturacion";
import { createFactura } from "@/server/actions/facturacion";
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

export default function FacturaForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tratamientos, setTratamientos] = useState<
    { id: string; diagnostico: string; procedimiento_realizado: string; fecha: string }[]
  >([]);
  const router = useRouter();

  const form = useForm<FacturaInput>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      patient_id: "",
      tratamiento_id: "",
      monto_total: "",
      fecha_emision: new Date().toISOString().slice(0, 10),
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

  async function onSubmit(values: FacturaInput) {
    setLoading(true);
    setServerError(null);

    const result = await createFactura(values);
    if (result && "error" in result) {
      setServerError(result.error);
      setLoading(false);
      return;
    }
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
            name="monto_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto total *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="150000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha_emision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de emisión *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
            {loading ? "Creando..." : "Crear factura"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
