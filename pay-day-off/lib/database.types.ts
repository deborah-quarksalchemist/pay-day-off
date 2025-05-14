export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "admin" | "employee";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: "admin" | "employee";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "admin" | "employee";
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          hire_date: string;
          department: string | null;
          position: string | null;
          accumulated_pdo: number;
          used_pdo: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          hire_date: string;
          department?: string | null;
          position?: string | null;
          accumulated_pdo?: number;
          used_pdo?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hire_date?: string;
          department?: string | null;
          position?: string | null;
          accumulated_pdo?: number;
          used_pdo?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdo_requests: {
        Row: {
          id: string;
          employee_id: string;
          start_date: string;
          end_date: string;
          days_count: number;
          status: "pending" | "approved" | "rejected";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          start_date: string;
          end_date: string;
          days_count: number;
          status: "pending" | "approved" | "rejected";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          start_date?: string;
          end_date?: string;
          days_count?: number;
          status?: "pending" | "approved" | "rejected";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdo_accruals: {
        Row: {
          id: string;
          employee_id: string;
          accrual_date: string;
          days_accrued: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          accrual_date: string;
          days_accrued: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          accrual_date?: string;
          days_accrued?: number;
          reason?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updateables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
