import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatientById } from "@/server/actions/patients";
import { getTratamientosByPatient } from "@/server/actions/tratamientos";
import { Button } from "@/components/ui/button";
import { IoMdArrowBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";

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

export default async function HistorialPage({ params }: Props) {
  const { id } = await params;
  const { data: patient } = await getPatientById(id);
  if (!patient) notFound();

  const tratamientos = await getTratamientosByPatient(id);

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
              Historial de {patient.full_name}
            </h1>
          </div>
        </div>
        <Link href={`/tratamientos/nuevo?patient_id=${id}`}>
          <Button>
            <FaPlus /> Nuevo tratamiento
          </Button>
        </Link>
      </div>

      {tratamientos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          No hay tratamientos registrados para este paciente.
        </div>
      ) : (
        <div className="space-y-4">
          {tratamientos.map((t, i) => (
            <div
              key={t.id}
              className="bg-card border border-border rounded-lg p-5 relative"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                  {i < tratamientos.length - 1 && (
                    <div className="w-0.5 h-full bg-border my-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-foreground">
                      {formatDate(t.fecha)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      — Dr(a). {t.dentist_name}
                    </span>
                    {t.cita_info && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Vinculado a cita del{" "}
                        {formatDate((t.cita_info as { fecha: string }).fecha)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Diagnóstico
                      </p>
                      <p className="text-foreground">{t.diagnostico}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Procedimiento
                      </p>
                      <p className="text-foreground">
                        {t.procedimiento_realizado}
                      </p>
                    </div>
                  </div>
                  {t.observaciones && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Observaciones
                      </p>
                      <p className="text-sm text-foreground/80">
                        {t.observaciones}
                      </p>
                    </div>
                  )}
                  <div className="mt-3">
                    <Link href={`/tratamientos/${t.id}`}>
                      <Button variant="outline" size="xs">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
