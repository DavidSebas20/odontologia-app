export type UserRole = "admin" | "dentista" | "recepcion" | "paciente";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type StaffAssignment =
  Database["public"]["Tables"]["staff_assignments"]["Row"];
export type Cita = Database["public"]["Tables"]["citas"]["Row"];
export type Tratamiento =
  Database["public"]["Tables"]["tratamientos"]["Row"];
export type Factura = Database["public"]["Tables"]["facturas"]["Row"];
export type Pago = Database["public"]["Tables"]["pagos"]["Row"];
export type Consentimiento =
  Database["public"]["Tables"]["consentimientos"]["Row"];

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
      tratamientos: {
        Row: {
          id: string;
          patient_id: string;
          dentist_id: string;
          cita_id: string | null;
          fecha: string;
          diagnostico: string;
          procedimiento_realizado: string;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          dentist_id: string;
          cita_id?: string | null;
          fecha?: string;
          diagnostico: string;
          procedimiento_realizado: string;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          dentist_id?: string;
          cita_id?: string | null;
          fecha?: string;
          diagnostico?: string;
          procedimiento_realizado?: string;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      facturas: {
        Row: {
          id: string;
          patient_id: string;
          tratamiento_id: string | null;
          monto_total: number;
          estado: "pendiente" | "pagado" | "parcial" | "anulado";
          fecha_emision: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tratamiento_id?: string | null;
          monto_total: number;
          estado?: "pendiente" | "pagado" | "parcial" | "anulado";
          fecha_emision?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tratamiento_id?: string | null;
          monto_total?: number;
          estado?: "pendiente" | "pagado" | "parcial" | "anulado";
          fecha_emision?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      pagos: {
        Row: {
          id: string;
          factura_id: string;
          monto: number;
          metodo_pago: "efectivo" | "tarjeta" | "transferencia";
          fecha_pago: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          factura_id: string;
          monto: number;
          metodo_pago?: "efectivo" | "tarjeta" | "transferencia";
          fecha_pago?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          factura_id?: string;
          monto?: number;
          metodo_pago?: "efectivo" | "tarjeta" | "transferencia";
          fecha_pago?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      consentimientos: {
        Row: {
          id: string;
          patient_id: string;
          tratamiento_id: string | null;
          tipo_consentimiento: string;
          contenido: string;
          firmado: boolean;
          fecha_firma: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tratamiento_id?: string | null;
          tipo_consentimiento: string;
          contenido: string;
          firmado?: boolean;
          fecha_firma?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tratamiento_id?: string | null;
          tipo_consentimiento?: string;
          contenido?: string;
          firmado?: boolean;
          fecha_firma?: string | null;
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
