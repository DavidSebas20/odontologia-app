import FacturaForm from "@/components/facturacion/factura-form";

export default function NuevaFacturaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nueva factura</h1>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <FacturaForm />
      </div>
    </div>
  );
}
