import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatientById } from "@/server/actions/patients";
import PatientForm from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import { IoMdArrowBack } from "react-icons/io";

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

export default async function PacienteDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: patient, error } = await getPatientById(id);

  if (error || !patient) notFound();

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pacientes">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <IoMdArrowBack /> Pacientes
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {patient.full_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Registrado el {formatDate(patient.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de edición */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-5">
            Datos del paciente
          </h2>
          <PatientForm patient={patient} />
        </div>

        {/* Panel de resumen */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Resumen
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{patient.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="font-medium">{patient.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="font-medium">{formatDate(patient.dob)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd className="font-medium">{patient.address ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Módulos de historial y citas */}
          <Link href={`/pacientes/${patient.id}/historial`} className="block">
            <div className="bg-card border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
              <h3 className="font-semibold mb-1 text-sm">Historial clínico</h3>
              <p className="text-xs text-muted-foreground">
                Ver tratamientos registrados
              </p>
            </div>
          </Link>
          <Link href={`/pacientes/${patient.id}/consentimientos`} className="block">
            <div className="bg-card border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
              <h3 className="font-semibold mb-1 text-sm">Consentimientos</h3>
              <p className="text-xs text-muted-foreground">
                Ver y gestionar consentimientos
              </p>
            </div>
          </Link>
          <div className="bg-card border rounded-lg p-5 opacity-60">
            <h3 className="font-semibold mb-1 text-sm">Citas</h3>
            <p className="text-xs text-muted-foreground">
              Ver en módulo de Citas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
