import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PdoRequestsList } from "@/components/pdo/pdo-requests-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function MyPdoPage() {
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
    redirect("/");
  }

  // Obtener solicitudes del empleado
  const { data: requests } = await supabase
    .from("pdo_requests")
    .select(
      `
      id,
      start_date,
      end_date,
      days_count,
      status,
      notes
    `
    )
    .eq("employee_id", session.user.id)
    .order("start_date", { ascending: false });

  const formattedRequests =
    requests?.map((req) => ({
      id: req.id,
      employeeName: "",
      startDate: formatDate(req.start_date),
      endDate: formatDate(req.end_date),
      daysCount: req.days_count,
      status: req.status,
    })) || [];

  // Calcular días disponibles
  const availablePdo =
    (employeeData.accumulated_pdo || 0) - (employeeData.used_pdo || 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Días Libres">
        <Button asChild>
          <Link href="/my-pdo/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Solicitar días libres
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Días Acumulados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData.accumulated_pdo.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Días Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData.used_pdo.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Días Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availablePdo.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>
            Todas tus solicitudes de días libres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PdoRequestsList requests={formattedRequests} isAdmin={false} />
        </CardContent>
      </Card>
    </div>
  );
}
