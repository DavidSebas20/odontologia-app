import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const kpisByRole: Record<
  UserRole,
  Array<{ label: string; value: string; description: string }>
> = {
  admin: [
    { label: "Citas hoy", value: "—", description: "Se activará en Fase 2" },
    {
      label: "Pacientes activos",
      value: "—",
      description: "Se activará en Fase 1",
    },
    {
      label: "Tratamientos en curso",
      value: "—",
      description: "Se activará en Fase 3",
    },
    {
      label: "Saldo pendiente",
      value: "—",
      description: "Se activará en Fase 5",
    },
  ],
  dentista: [
    {
      label: "Mis citas hoy",
      value: "—",
      description: "Se activará en Fase 2",
    },
    {
      label: "Mis pacientes",
      value: "—",
      description: "Se activará en Fase 1",
    },
    {
      label: "Tratamientos activos",
      value: "—",
      description: "Se activará en Fase 3",
    },
    {
      label: "Pendientes de firma",
      value: "—",
      description: "Se activará en Fase 4",
    },
  ],
  recepcion: [
    { label: "Citas hoy", value: "—", description: "Se activará en Fase 2" },
    {
      label: "Por confirmar",
      value: "—",
      description: "Se activará en Fase 2",
    },
    {
      label: "Nuevos pacientes",
      value: "—",
      description: "Se activará en Fase 1",
    },
    {
      label: "Pagos pendientes",
      value: "—",
      description: "Se activará en Fase 5",
    },
  ],
  paciente: [
    {
      label: "Mis próximas citas",
      value: "—",
      description: "Se activará en Fase 2",
    },
    {
      label: "Mis tratamientos",
      value: "—",
      description: "Se activará en Fase 3",
    },
    {
      label: "Saldo pendiente",
      value: "—",
      description: "Se activará en Fase 5",
    },
    {
      label: "Documentos pendientes",
      value: "—",
      description: "Se activará en Fase 4",
    },
  ],
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const kpis = kpisByRole[profile?.role ?? "paciente"];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bienvenido, {profile?.full_name ?? profile?.email} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Accediste como{" "}
          <span className="font-medium capitalize">{profile?.role}</span>. Aquí
          tienes un resumen de la clínica.
        </p>
      </div>

      {/* KPIs por rol */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card border rounded-lg p-6 flex flex-col gap-1"
          >
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-3xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground/70">
              {kpi.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
