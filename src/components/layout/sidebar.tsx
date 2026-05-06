"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile, UserRole } from "@/types/database";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["admin", "dentista", "recepcion", "paciente"],
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    roles: ["admin", "dentista", "recepcion"],
  },
  {
    label: "Citas",
    href: "/citas",
    roles: ["admin", "dentista", "recepcion", "paciente"],
  },
  {
    label: "Historial Clínico",
    href: "/historial",
    roles: ["admin", "dentista", "paciente"],
  },
  {
    label: "Consentimientos",
    href: "/consentimientos",
    roles: ["admin", "dentista"],
  },
  {
    label: "Pagos",
    href: "/pagos",
    roles: ["admin", "recepcion"],
  },
];

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  dentista: "Dentista",
  recepcion: "Recepción",
  paciente: "Paciente",
};

interface SidebarProps {
  profile: Profile;
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(profile.role),
  );

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col shrink-0">
      {/* Encabezado */}
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg leading-tight">🦷 Clínica Dental</h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {profile.full_name ?? profile.email}
        </p>
        <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {roleLabel[profile.role]}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 border-t">
        <form action={logoutAction}>
          <Button variant="outline" className="w-full" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
