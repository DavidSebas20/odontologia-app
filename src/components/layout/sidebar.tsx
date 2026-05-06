"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTooth } from "react-icons/fa";
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
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col shrink-0">
      {/* Encabezado */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <FaTooth className="text-white" size={24} />
          </div>
          <h1 className="font-semibold text-base leading-tight text-foreground">
            Clínica Dental
          </h1>
        </div>
        <span className="inline-block mt-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {roleLabel[profile.role]}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-[#072d6b] text-white font-semibold"
                : "text-foreground/70 hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-3 border-t border-border">
        <form action={logoutAction}>
          <Button variant="outline" className="w-full" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
