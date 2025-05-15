import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, isEmployee } from "@/lib/utils";
import { PdoRequestsList } from "@/components/pdo/pdo-requests-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Clock, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  try {
    // Verificar sesión y rol
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/login");
      return null;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error || !userData) {
      console.error("Error al verificar el usuario en employee page:", error);
      redirect("/login");
      return null;
    }

    if (!isEmployee(userData?.role)) {
      redirect("/dashboard/admin");
      return null;
    }

    // Obtener datos del empleado
    const { data: employeeData } = await supabase
      .from("employees")
      .select("accumulated_pdo, used_pdo")
      .eq("id", session.user.id)
      .single();

    // Obtener solicitudes recientes del empleado
    const { data: recentRequests } = await supabase
      .from("pdo_requests")
      .select(
        `
        id,
        start_date,
        end_date,
        days_count,
        status
      `
      )
      .eq("employee_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const formattedRequests =
      recentRequests?.map((req) => ({
        id: req.id,
        employeeName: "",
        startDate: formatDate(req.start_date),
        endDate: formatDate(req.end_date),
        daysCount: req.days_count,
        status: req.status,
      })) || [];

    // Calcular días disponibles
    const availablePdo =
      (employeeData?.accumulated_pdo || 0) - (employeeData?.used_pdo || 0);

    return (
      <div className="space-y-6">
        <PageHeader title="Mi Dashboard">
          <Button asChild>
            <Link href="/my-pdo/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Solicitar días libres
            </Link>
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Días Disponibles
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {availablePdo.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Días Acumulados
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData?.accumulated_pdo.toFixed(1) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Días Utilizados
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData?.used_pdo.toFixed(1) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Mis Solicitudes Recientes</CardTitle>
            <CardDescription>
              Historial de solicitudes de días libres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PdoRequestsList requests={formattedRequests} isAdmin={false} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error en la página de employee:", error);
    redirect("/login");
    return null;
  }
}
