import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PdoRequestForm } from "@/components/pdo/pdo-request-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewPdoRequestPage() {
  const supabase = await createClient();

  // Verificar sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Obtener datos del empleado
  const { data: employeeData } = await supabase
    .from("employees")
    .select("accumulated_pdo, used_pdo")
    .eq("id", session.user.id)
    .single();

  if (!employeeData) {
    redirect("/dashboard/employee");
  }

  // Calcular días disponibles
  const availablePdo =
    (employeeData.accumulated_pdo || 0) - (employeeData.used_pdo || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar Días Libres"
        showBackButton={true}
        backButtonHref="/my-pdo"
      />
      <PdoRequestForm availablePdo={availablePdo} />
    </div>
  );
}
