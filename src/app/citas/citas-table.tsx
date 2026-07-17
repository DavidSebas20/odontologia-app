"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getCitas } from "@/server/actions/citas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CitaRow = {
  id: string;
  patient_id: string;
  dentist_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado: string;
  notas: string | null;
  created_at: string;
  patient_name: string;
  dentist_name: string;
};

interface CitasTableProps {
  citas: CitaRow[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmada: "bg-green-100 text-green-800 border-green-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
  completada: "bg-blue-100 text-blue-800 border-blue-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CitasTable({ citas: initialCitas }: CitasTableProps) {
  const [citas, setCitas] = useState<CitaRow[]>(initialCitas);
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFilter() {
    startTransition(async () => {
      const result = await getCitas({
        fecha: fecha || undefined,
        estado: estado || undefined,
      });
      if (result) setCitas(result as CitaRow[]);
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="max-w-[180px]"
          placeholder="Filtrar por fecha"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm max-w-[180px]"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
          <option value="completada">Completada</option>
        </select>
        <Button variant="outline" size="sm" onClick={handleFilter}>
          Filtrar
        </Button>
        {isPending && (
          <span className="text-xs text-muted-foreground">Buscando...</span>
        )}
      </div>

      {citas.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          No se encontraron citas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Hora</th>
                <th className="text-left px-4 py-3 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 font-medium">Odontólogo</th>
                <th className="text-left px-4 py-3 font-medium">Motivo</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {citas.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {formatDate(c.fecha)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.hora_inicio.slice(0, 5)} - {c.hora_fin.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3 font-medium">{c.patient_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.dentist_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {c.motivo}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={estadoColor[c.estado] ?? ""}>
                      {c.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/citas/${c.id}`}>
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
