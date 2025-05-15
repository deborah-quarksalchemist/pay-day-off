import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();

  // Verificar sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Obtener todas las solicitudes aprobadas
  const { data: approvedRequests } = await supabase
    .from("pdo_requests")
    .select(
      `
      id,
      employee_id,
      start_date,
      end_date,
      users!inner(full_name)
    `
    )
    .eq("status", "approved");

  // Formatear los datos para el calendario
  const events =
    approvedRequests?.map((req) => ({
      id: req.id,
      title: req.users.full_name,
      start: new Date(req.start_date),
      end: new Date(req.end_date),
      employeeId: req.employee_id,
      allDay: true,
    })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario de Días Libres"
        description="Visualiza los días libres aprobados de todos los empleados"
      />
      <div className="border rounded-md p-4 bg-card">
        <CalendarView events={events} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
