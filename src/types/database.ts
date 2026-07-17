export type UserRole = "admin" | "dentista" | "recepcion" | "paciente";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type StaffAssignment =
  Database["public"]["Tables"]["staff_assignments"]["Row"];
export type Cita = Database["public"]["Tables"]["citas"]["Row"];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          dob: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          dob?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          dob?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      staff_assignments: {
        Row: {
          id: string;
          user_id: string;
          specialty: string;
          status: "activo" | "inactivo";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialty: string;
          status?: "activo" | "inactivo";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialty?: string;
          status?: "activo" | "inactivo";
          created_at?: string;
        };
        Relationships: [];
      };
      citas: {
        Row: {
          id: string;
          patient_id: string;
          dentist_id: string;
          fecha: string;
          hora_inicio: string;
          hora_fin: string;
          motivo: string;
          estado: "pendiente" | "confirmada" | "cancelada" | "completada";
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          dentist_id: string;
          fecha: string;
          hora_inicio: string;
          hora_fin: string;
          motivo: string;
          estado?: "pendiente" | "confirmada" | "cancelada" | "completada";
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          dentist_id?: string;
          fecha?: string;
          hora_inicio?: string;
          hora_fin?: string;
          motivo?: string;
          estado?: "pendiente" | "confirmada" | "cancelada" | "completada";
          notas?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
