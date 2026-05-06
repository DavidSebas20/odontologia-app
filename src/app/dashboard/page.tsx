import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

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

  const role: UserRole = (profile?.role as UserRole) ?? "paciente";

  // Métricas Fase 1: conteo de pacientes
  const [{ count: totalPatients }, { count: newPatientsThisMonth }] =
    await Promise.all([
      supabase
        .from("patients")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        ),
    ]);

  type KPI = { label: string; value: string; description: string; href?: string };

  const kpisByRole: Record<UserRole, KPI[]> = {
    admin: [
      { label: "Citas hoy", value: "—", description: "Se activará en Fase 2" },
      {
        label: "Pacientes activos",
        value: String(totalPatients ?? 0),
        description: "Total de pacientes registrados",
        href: "/pacientes",
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
      { label: "Mis citas hoy", value: "—", description: "Se activará en Fase 2" },
      {
        label: "Total pacientes",
        value: String(totalPatients ?? 0),
        description: "Pacientes en el sistema",
        href: "/pacientes",
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
      { label: "Por confirmar", value: "—", description: "Se activará en Fase 2" },
      {
        label: "Nuevos pacientes (mes)",
        value: String(newPatientsThisMonth ?? 0),
        description: "Registrados este mes",
        href: "/pacientes",
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

  const kpis = kpisByRole[role];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {profile?.full_name ?? profile?.email}
        </h1>
        <p className="text-muted-foreground mt-1">
          Accediste como{" "}
          <span className="font-semibold text-primary capitalize">
            {roleLabel[role]}
          </span>
          . Aquí tienes un resumen de la clínica.
        </p>
      </div>

      {/* KPIs por rol */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const card = (
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-1 hover:border-primary/30 hover:shadow-sm transition-all h-full">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {kpi.label}
              </p>
              <p className="text-3xl font-bold text-primary mt-1">{kpi.value}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {kpi.description}
              </p>
            </div>
          );
          return (
            <div key={kpi.label}>
              {kpi.href ? (
                <a href={kpi.href} className="block h-full">
                  {card}
                </a>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  dentista: "Dentista",
  recepcion: "Recepción",
  paciente: "Paciente",
};
