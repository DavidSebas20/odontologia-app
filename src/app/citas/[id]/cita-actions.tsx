"use client";

import { useState } from "react";
import { changeCitaState } from "@/server/actions/citas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const estados = ["pendiente", "confirmada", "cancelada", "completada"] as const;

interface CitaActionsProps {
  citaId: string;
  currentEstado: string;
}

export default function CitaActions({ citaId, currentEstado }: CitaActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(estado: string) {
    setLoading(estado);
    setError(null);
    const result = await changeCitaState(citaId, {
      estado: estado as typeof estados[number],
    });
    if (result.error) setError(result.error);
    setLoading(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar estado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {estados.map((estado) => (
          <Button
            key={estado}
            variant={currentEstado === estado ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            disabled={loading === estado || currentEstado === estado}
            onClick={() => handleChange(estado)}
          >
            {loading === estado
              ? "..."
              : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Button>
        ))}
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
