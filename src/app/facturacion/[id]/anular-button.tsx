"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { anularFactura } from "@/server/actions/facturacion";
import { Button } from "@/components/ui/button";

export default function AnularButton({ facturaId }: { facturaId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAnular() {
    if (!confirm("¿Estás seguro de anular esta factura?")) return;
    setLoading(true);
    await anularFactura(facturaId);
    router.refresh();
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleAnular}
        disabled={loading}
      >
        {loading ? "Anulando..." : "Anular factura"}
      </Button>
    </div>
  );
}
