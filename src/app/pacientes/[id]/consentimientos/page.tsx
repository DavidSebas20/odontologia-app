import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatientById } from "@/server/actions/patients";
import { getConsentimientosByPatient } from "@/server/actions/consentimientos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IoMdArrowBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import FirmarButton from "./firmar-button";
import PrintButton from "./print-button";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ConsentimientosPage({ params }: Props) {
  const { id } = await params;
  const { data: patient } = await getPatientById(id);
  if (!patient) notFound();

  const consentimientos = await getConsentimientosByPatient(id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/pacientes/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <IoMdArrowBack /> Paciente
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Consentimientos de {patient.full_name}
            </h1>
          </div>
        </div>
        <Link href={`/consentimientos/nuevo?patient_id=${id}`}>
          <Button>
            <FaPlus /> Nuevo consentimiento
          </Button>
        </Link>
      </div>

      {consentimientos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          No hay consentimientos registrados para este paciente.
        </div>
      ) : (
        <div className="space-y-4">
          {consentimientos.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {c.tipo_consentimiento}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Creado el {formatDate(c.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      c.firmado
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {c.firmado
                      ? `Firmado ${formatDate(c.fecha_firma)}`
                      : "Pendiente"}
                  </Badge>
                </div>
              </div>
              <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap font-mono text-foreground/80 max-h-64 overflow-y-auto">
                {c.contenido}
              </div>
              <div className="flex items-center gap-2 mt-3">
                {!c.firmado && <FirmarButton consentimientoId={c.id} />}
                <PrintButton contenido={c.contenido} tipo={c.tipo_consentimiento} />
                <Link href={`/consentimientos/${c.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
