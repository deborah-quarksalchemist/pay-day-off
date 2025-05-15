import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, isAdmin } from "@/lib/utils";
import { EmployeesList } from "@/components/employees/employees-list";
import { PageHeader } from "@/components/layout/page-header";

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
    .from("vw_employees_with_user")
    .select("*")
    .order("full_name", { ascending: true });

  console.log(employees);

  const formattedEmployees =
    employees?.map((emp) => ({
      id: emp.id,
      name: emp.full_name || "",
      email: emp.email || "",
      department: emp.department || "-",
      position: emp.position || "-",
      hireDate: formatDate(emp.hire_date),
      hireDateRaw: emp.hire_date,
      pdoBalance: (emp.accumulated_pdo - emp.used_pdo).toFixed(1),
      accumulatedPdo: emp.accumulated_pdo,
      usedPdo: emp.used_pdo,
    })) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Gestión de Empleados"></PageHeader>

      <EmployeesList
        employees={JSON.parse(JSON.stringify(formattedEmployees))}
      />
    </div>
  );
}
