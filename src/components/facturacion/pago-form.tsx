"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pagoSchema, type PagoInput } from "@/lib/validators/facturacion";
import { registerPago } from "@/server/actions/facturacion";
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

interface PagoFormProps {
  facturaId: string;
}

export default function PagoForm({ facturaId }: PagoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<PagoInput>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      factura_id: facturaId,
      monto: "",
      metodo_pago: "efectivo",
      fecha_pago: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(values: PagoInput) {
    setLoading(true);
    setServerError(null);

    const result = await registerPago(values);
    if (result && "error" in result) {
      setServerError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto *</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metodo_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de pago</FormLabel>
              <FormControl>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fecha_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de pago</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Registrando..." : "Registrar pago"}
        </Button>
      </form>
    </Form>
  );
}
