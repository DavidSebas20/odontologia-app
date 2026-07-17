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

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: totalPatients },
    { count: newPatientsThisMonth },
    { count: citasHoy },
    { count: citasPendientes },
    { count: misCitasHoy },
    { count: tratamientosTotal },
    { count: consentimientosPendientes },
    { count: facturasPendientes },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today).eq("dentist_id", user!.id),
    supabase.from("tratamientos").select("*", { count: "exact", head: true }),
    supabase.from("consentimientos").select("*", { count: "exact", head: true }).eq("firmado", false),
    supabase.from("facturas").select("*", { count: "exact", head: true }).in("estado", ["pendiente", "parcial"]),
  ]);

  type KPI = {
    label: string;
    value: string;
    description: string;
    href?: string;
  };

  const kpisByRole: Record<UserRole, KPI[]> = {
    admin: [
      {
        label: "Citas hoy",
        value: String(citasHoy ?? 0),
        description: "Agendadas para hoy",
        href: "/citas",
      },
      {
        label: "Pacientes activos",
        value: String(totalPatients ?? 0),
        description: "Total de pacientes registrados",
        href: "/pacientes",
      },
      {
        label: "Tratamientos",
        value: String(tratamientosTotal ?? 0),
        description: "Total de tratamientos registrados",
        href: "/pacientes",
      },
      {
        label: "Saldo pendiente",
        value: String(facturasPendientes ?? 0),
        description: "Facturas pendientes o parciales",
        href: "/facturacion",
      },
    ],
    dentista: [
      {
        label: "Mis citas hoy",
        value: String(misCitasHoy ?? 0),
        description: "Agendadas para hoy",
        href: "/citas",
      },
      {
        label: "Total pacientes",
        value: String(totalPatients ?? 0),
        description: "Pacientes en el sistema",
        href: "/pacientes",
      },
      {
        label: "Tratamientos",
        value: String(tratamientosTotal ?? 0),
        description: "Total de tratamientos registrados",
        href: "/pacientes",
      },
      {
        label: "Por firmar",
        value: String(consentimientosPendientes ?? 0),
        description: "Consentimientos pendientes de firma",
        href: "/pacientes",
      },
    ],
    recepcion: [
      {
        label: "Citas hoy",
        value: String(citasHoy ?? 0),
        description: "Agendadas para hoy",
        href: "/citas",
      },
      {
        label: "Por confirmar",
        value: String(citasPendientes ?? 0),
        description: "Citas en estado pendiente",
        href: "/citas",
      },
      {
        label: "Nuevos pacientes (mes)",
        value: String(newPatientsThisMonth ?? 0),
        description: "Registrados este mes",
        href: "/pacientes",
      },
      {
        label: "Pagos pendientes",
        value: String(facturasPendientes ?? 0),
        description: "Facturas pendientes o parciales",
        href: "/facturacion",
      },
    ],
    paciente: [
      {
        label: "Mis próximas citas",
        value: String(citasPendientes ?? 0),
        description: "Citas pendientes",
      },
      {
        label: "Mis tratamientos",
        value: String(tratamientosTotal ?? 0),
        description: "Tratamientos registrados",
      },
      {
        label: "Saldo pendiente",
        value: String(facturasPendientes ?? 0),
        description: "Facturas pendientes",
      },
      {
        label: "Documentos pendientes",
        value: String(consentimientosPendientes ?? 0),
        description: "Consentimientos por firmar",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const card = (
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-1 hover:border-primary/30 hover:shadow-sm transition-all h-full">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {kpi.label}
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                {kpi.value}
              </p>
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
