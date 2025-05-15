import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, isAdmin } from "@/lib/utils";
import { PdoRequestsList } from "@/components/pdo/pdo-requests-list";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminDashboardPage() {
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
      console.error("Error al verificar el usuario en admin page:", error);
      redirect("/login");
      return null;
    }

    if (!isAdmin(userData?.role)) {
      redirect("/dashboard/employee");
      return null;
    }

    // Obtener estadísticas
    const { data: employeesCount } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });

    const { data: pendingRequests } = await supabase
      .from("pdo_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // Obtener solicitudes pendientes
    const { data: recentRequests } = await supabase
      .from("pdo_requests")
      .select(
        `
        id,
        start_date,
        end_date,
        days_count,
        status,
        employees!inner(id),
        users!inner(full_name)
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    const formattedRequests =
      recentRequests?.map((req) => ({
        id: req.id,
        employeeName: req.users.full_name,
        startDate: formatDate(req.start_date),
        endDate: formatDate(req.end_date),
        daysCount: req.days_count,
        status: req.status,
      })) || [];

    return (
      <div className="space-y-6">
        <PageHeader title="Panel de Administración">
          <Button asChild>
            <Link href="/api/update-pdo">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar PDO
            </Link>
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Empleados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeesCount?.count || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Solicitudes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingRequests?.count || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fecha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(new Date())}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>
              Solicitudes de días libres que requieren aprobación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PdoRequestsList requests={formattedRequests} isAdmin={true} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error en la página de admin:", error);
    redirect("/login");
    return null;
  }
}
