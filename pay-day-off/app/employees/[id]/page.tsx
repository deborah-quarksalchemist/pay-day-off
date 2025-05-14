import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { EmployeeForm } from "@/components/employees/employee-form";

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
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

  // Obtener datos del empleado
  const { data: employee } = await supabase
    .from("employees")
    .select(
      `
      id,
      hire_date,
      department,
      position,
      users!inner(full_name, email)
    `
    )
    .eq("id", params.id)
    .single();

  if (!employee) {
    redirect("/employees");
  }

  const defaultValues = {
    fullName: employee.users.full_name,
    email: employee.users.email,
    department: employee.department || "",
    position: employee.position || "",
    hireDate: new Date(employee.hire_date),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Empleado</h1>
      <EmployeeForm employeeId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
