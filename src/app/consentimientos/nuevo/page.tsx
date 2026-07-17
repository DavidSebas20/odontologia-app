import ConsentimientoForm from "@/components/consentimientos/consentimiento-form";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NuevoConsentimientoPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const patientId = params.patient_id;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Nuevo consentimiento
        </h1>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <ConsentimientoForm preselectedPatientId={patientId} />
      </div>
    </div>
  );
}
