import { notFound } from "next/navigation";
import Link from "next/link";
import { getCitaById } from "@/server/actions/citas";
import CitaForm from "@/components/citas/cita-form";
import CitaActions from "./cita-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IoMdArrowBack } from "react-icons/io";

interface Props {
  params: Promise<{ id: string }>;
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmada: "bg-green-100 text-green-800 border-green-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
  completada: "bg-blue-100 text-blue-800 border-blue-200",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CitaDetailPage({ params }: Props) {
  const { id } = await params;
  const cita = await getCitaById(id);

  if (!cita) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/citas">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <IoMdArrowBack /> Citas
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Cita de {cita.patient_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {formatDate(cita.fecha)} · {cita.dentist_name}
          </p>
        </div>
        <Badge className={estadoColor[cita.estado as string] ?? ""}>
          {cita.estado as string}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-5">Editar cita</h2>
          <CitaForm
            cita={{
              id: cita.id as string,
              patient_id: cita.patient_id as string,
              dentist_id: cita.dentist_id as string,
              fecha: cita.fecha as string,
              hora_inicio: cita.hora_inicio as string,
              hora_fin: cita.hora_fin as string,
              motivo: cita.motivo as string,
              estado: cita.estado as string,
              notas: cita.notas as string | null,
            }}
          />
        </div>

        <div className="space-y-4">
          <CitaActions
            citaId={cita.id as string}
            currentEstado={cita.estado as string}
          />

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Resumen
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Paciente</dt>
                <dd className="font-medium">
                  <Link
                    href={`/pacientes/${cita.patient_id}`}
                    className="text-primary hover:underline"
                  >
                    {cita.patient_name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Odontólogo</dt>
                <dd className="font-medium">{cita.dentist_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fecha</dt>
                <dd className="font-medium">{formatDate(cita.fecha as string)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Horario</dt>
                <dd className="font-medium">
                  {(cita.hora_inicio as string)?.slice(0, 5)} - {(cita.hora_fin as string)?.slice(0, 5)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Notas</dt>
                <dd className="font-medium">{(cita.notas as string) ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
