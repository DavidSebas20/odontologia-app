"use client";

import { Button } from "@/components/ui/button";

export default function PrintButton({
  contenido,
  tipo,
}: {
  contenido: string;
  tipo: string;
}) {
  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${tipo}</title></head>
        <body style="font-family: serif; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.6;">
          <h2>${tipo}</h2>
          <pre style="white-space: pre-wrap; font-family: serif; font-size: 14px;">${contenido}</pre>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      Imprimir
    </Button>
  );
}
