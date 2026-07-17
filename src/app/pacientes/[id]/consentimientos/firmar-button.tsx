"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { firmarConsentimiento } from "@/server/actions/consentimientos";
import { Button } from "@/components/ui/button";

export default function FirmarButton({
  consentimientoId,
}: {
  consentimientoId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFirmar() {
    setLoading(true);
    await firmarConsentimiento(consentimientoId);
    router.refresh();
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleFirmar}
      disabled={loading}
    >
      {loading ? "Firmando..." : "Firmar"}
    </Button>
  );
}
