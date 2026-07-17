import { notFound } from "next/navigation";
import Link from "next/link";
import { getTratamientoById } from "@/server/actions/tratamientos";
import TratamientoForm from "@/components/tratamientos/tratamiento-form";
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

export default async function TratamientoDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTratamientoById(id);

  if (!t) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/pacientes/${t.patient_id}/historial`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <IoMdArrowBack /> Historial
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Tratamiento de {t.patient_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {formatDate(t.fecha)} · Dr(a). {t.dentist_name}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <h2 className="font-semibold text-foreground mb-5">
          Editar tratamiento
        </h2>
        <TratamientoForm
          tratamiento={{
            id: t.id as string,
            patient_id: t.patient_id as string,
            dentist_id: t.dentist_id as string,
            cita_id: t.cita_id as string | null,
            fecha: t.fecha as string,
            diagnostico: t.diagnostico as string,
            procedimiento_realizado: t.procedimiento_realizado as string,
            observaciones: t.observaciones as string | null,
          }}
        />
      </div>
    </div>
  );
}
