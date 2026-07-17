import Link from "next/link";
import { getFacturas } from "@/server/actions/facturacion";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import FacturasTable from "./facturas-table";

export default async function FacturacionPage() {
  const facturas = await getFacturas();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        </div>
        <Link href="/facturacion/nueva">
          <Button>
            <FaPlus /> Nueva factura
          </Button>
        </Link>
      </div>

      <FacturasTable facturas={facturas} />
    </div>
  );
}
