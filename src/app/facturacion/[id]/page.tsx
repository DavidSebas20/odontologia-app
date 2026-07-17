import { notFound } from "next/navigation";
import Link from "next/link";
import { getFacturaById } from "@/server/actions/facturacion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PagoForm from "@/components/facturacion/pago-form";
import AnularButton from "./anular-button";
import { IoMdArrowBack } from "react-icons/io";

interface Props {
  params: Promise<{ id: string }>;
}

interface FacturaDetail {
  id: string;
  patient_id: string;
  patient_name: string;
  monto_total: number;
  estado: string;
  fecha_emision: string;
  total_pagado: number;
  saldo_pendiente: number;
  tratamiento_info: { diagnostico: string } | null;
  pagos: { id: string; monto: number; metodo_pago: string; fecha_pago: string }[];
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function FacturaDetailPage({ params }: Props) {
  const { id } = await params;
  const factura = await getFacturaById(id) as FacturaDetail | null;

  if (!factura) notFound();

  const anulado = factura.estado === "anulado";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/facturacion">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <IoMdArrowBack /> Facturación
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Factura de {factura.patient_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Emitida el {formatDate(factura.fecha_emision)}
          </p>
        </div>
        <Badge className={estadoColor[factura.estado] ?? ""}>
          {factura.estado}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-4">
              Detalle de factura
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Monto total</dt>
                <dd className="font-bold text-lg">
                  {formatCurrency(Number(factura.monto_total))}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total pagado</dt>
                <dd className="font-bold text-lg text-green-700">
                  {formatCurrency(factura.total_pagado)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Saldo pendiente</dt>
                <dd className="font-bold text-lg text-red-700">
                  {formatCurrency(factura.saldo_pendiente)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tratamiento</dt>
                <dd className="font-medium">
                  {factura.tratamiento_info?.diagnostico ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-4">
              Pagos registrados
            </h3>
            {factura.pagos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay pagos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b border-border">
                    <tr>
                      <th className="text-left py-2 font-medium">Fecha</th>
                      <th className="text-left py-2 font-medium">Método</th>
                      <th className="text-right py-2 font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {factura.pagos.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2">{formatDate(p.fecha_pago)}</td>
                        <td className="py-2 capitalize">{p.metodo_pago}</td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(Number(p.monto))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!anulado && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Registrar pago
              </h3>
              <PagoForm facturaId={factura.id} />
            </div>
          )}

          {!anulado && <AnularButton facturaId={factura.id} />}
        </div>
      </div>
    </div>
  );
}
