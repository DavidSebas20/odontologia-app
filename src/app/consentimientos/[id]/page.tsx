import { notFound } from "next/navigation";
import Link from "next/link";
import { getConsentimientoById } from "@/server/actions/consentimientos";
import ConsentimientoForm from "@/components/consentimientos/consentimiento-form";
import { Button } from "@/components/ui/button";
import { IoMdArrowBack } from "react-icons/io";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConsentimientoDetailPage({ params }: Props) {
  const { id } = await params;
  const consentimiento = await getConsentimientoById(id);

  if (!consentimiento) notFound();

  const data = consentimiento as {
    id: string;
    patient_id: string;
    tratamiento_id: string | null;
    tipo_consentimiento: string;
    contenido: string;
    firmado: boolean;
    fecha_firma: string | null;
    patient_name: string;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/pacientes/${data.patient_id}/consentimientos`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <IoMdArrowBack /> Consentimientos
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Editar consentimiento
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Paciente: {data.patient_name}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <ConsentimientoForm
          consentimiento={{
            id: data.id,
            patient_id: data.patient_id,
            tratamiento_id: data.tratamiento_id,
            tipo_consentimiento: data.tipo_consentimiento,
            contenido: data.contenido,
            firmado: data.firmado,
            fecha_firma: data.fecha_firma,
          }}
        />
      </div>
    </div>
  );
}
