import CitaForm from "@/components/citas/cita-form";

export default function NuevaCitaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nueva cita</h1>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <CitaForm />
      </div>
    </div>
  );
}
