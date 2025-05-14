import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const supabase = await createClient();

  // Verificar sesión y rol
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!isAdmin(userData?.role)) {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agregar Nuevo Empleado</h1>
      <EmployeeForm />
    </div>
  );
}
