import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, isAdmin } from "@/lib/utils";
import { EmployeesList } from "@/components/employees/employees-list";

export default async function EmployeesPage() {
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

  // Obtener lista de empleados
  const { data: employees } = await supabase
    .from("employees")
    .select(
      `
      id,
      hire_date,
      department,
      position,
      accumulated_pdo,
      used_pdo,
      users!inner(full_name, email)
    `
    )
    .order("users(full_name)", { ascending: true });

  const formattedEmployees =
    employees?.map((emp) => ({
      id: emp.id,
      name: emp.users.full_name,
      email: emp.users.email,
      department: emp.department || "-",
      position: emp.position || "-",
      hireDate: formatDate(emp.hire_date),
      pdoBalance: (emp.accumulated_pdo - emp.used_pdo).toFixed(1),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <Button asChild>
          <Link href="/employees/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Empleado
          </Link>
        </Button>
      </div>

      <EmployeesList employees={formattedEmployees} />
    </div>
  );
}
