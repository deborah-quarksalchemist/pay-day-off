import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { EmployeeForm } from "@/components/employees/employee-form";
import { PageHeader } from "@/components/layout/page-header";

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
  const { data: employee, error } = await supabase
    .from("employees")
    .select(
      `
    id,
    hire_date,
    department,
    position,
    users!employees_user_id_fkey(full_name, email)
  `
    )
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Error fetching employee:", error);
  } else {
    console.log("Employee data:", employee);
  }

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
      <PageHeader
        title={`Editar Empleado: ${employee.users.full_name}`}
        showBackButton={true}
        backButtonHref="/employees"
      />
      <EmployeeForm employeeId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
