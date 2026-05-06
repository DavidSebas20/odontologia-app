"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Patient } from "@/types/database";
import { searchPatients } from "@/server/actions/patients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PatientsTableProps {
  patients: Patient[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PatientsTable({
  patients: initialPatients,
}: PatientsTableProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setPatients(initialPatients);
      return;
    }
    startTransition(async () => {
      const result = await searchPatients(value);
      if (result.data) setPatients(result.data as Patient[]);
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {isPending && (
          <span className="text-xs text-muted-foreground">Buscando...</span>
        )}
      </div>

      {/* Tabla */}
      {patients.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          {"No se encontraron pacientes."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary/5 text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium">Fecha nac.</th>
                <th className="text-left px-4 py-3 font-medium">Registrado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{p.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.dob)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/pacientes/${p.id}`}>
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
