import PatientForm from "@/components/patients/patient-form";

export default function NuevoPacientePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nuevo paciente</h1>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <PatientForm />
      </div>
    </div>
  );
}
