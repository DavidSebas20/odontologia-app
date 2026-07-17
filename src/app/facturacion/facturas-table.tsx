"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getFacturas } from "@/server/actions/facturacion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FacturaRow = {
  id: string;
  patient_id: string;
  monto_total: number;
  estado: string;
  fecha_emision: string;
  created_at: string;
  patient_name: string;
};

interface FacturasTableProps {
  facturas: FacturaRow[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
  parcial: "bg-blue-100 text-blue-800",
  anulado: "bg-red-100 text-red-800",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FacturasTable({
  facturas: initialFacturas,
}: FacturasTableProps) {
  const [facturas, setFacturas] = useState<FacturaRow[]>(initialFacturas);
  const [estado, setEstado] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFilter() {
    startTransition(async () => {
      const result = await getFacturas({ estado: estado || undefined });
      if (result) setFacturas(result as FacturaRow[]);
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm max-w-[180px]"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="pagado">Pagado</option>
          <option value="anulado">Anulado</option>
        </select>
        <Button variant="outline" size="sm" onClick={handleFilter}>
          Filtrar
        </Button>
        {isPending && (
          <span className="text-xs text-muted-foreground">Buscando...</span>
        )}
      </div>

      {facturas.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          No se encontraron facturas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Emisión</th>
                <th className="text-left px-4 py-3 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 font-medium">Monto</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {facturas.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {formatDate(f.fecha_emision)}
                  </td>
                  <td className="px-4 py-3">
                    {f.patient_name}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(Number(f.monto_total))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={estadoColor[f.estado] ?? ""}>
                      {f.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/facturacion/${f.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/40 hover:bg-primary hover:text-white hover:border-primary"
                      >
                        Ver
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
