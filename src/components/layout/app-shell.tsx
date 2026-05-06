"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import type { Profile } from "@/types/database";
import { FaBars } from "react-icons/fa6";
import { FaTooth } from "react-icons/fa";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export default function AppShell({ profile, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0 z-10">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md text-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Alternar menú"
        >
          <FaBars size={18} />
        </button>
        {/* Logo visible cuando el sidebar está cerrado */}
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all duration-300",
            open ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <FaTooth className="text-white" size={14} />
          </div>
          <span className="font-semibold text-sm text-foreground whitespace-nowrap">
            Clínica Dental
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar wrapper animado */}
        <div
          className={cn(
            "h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            open ? "w-64" : "w-0",
          )}
        >
          <Sidebar profile={profile} onNavigate={() => setOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-muted/20 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
