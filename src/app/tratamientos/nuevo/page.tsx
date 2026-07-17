import TratamientoForm from "@/components/tratamientos/tratamiento-form";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NuevoTratamientoPage({ searchParams }: Props) {
  const params = await searchParams;
  const patientId = params.patient_id;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Nuevo tratamiento
        </h1>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <TratamientoForm preselectedPatientId={patientId} />
      </div>
    </div>
  );
}
