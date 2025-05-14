import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"

export default async function MyPdoPage() {
  const supabase = createClient()
  
  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }
  
  // Obtener datos del empleado
  const { data: employeeData } = await supabase
    .from("employees")
    .select("accumulated_pdo, used_pdo")
    .eq("id", session.user.id)
    .single()
  
  if (!employeeData) {
    redirect("/")
  }
  
  // Obtener solicitudes del empleado
  const { data: requests } = await supabase
    .from("pdo_requests")
    .select(`
      id,
      start_date,
      end_date,
      days_count,
      status,
      notes
    `)
    .eq("employee_id", session.user.id)
    .order("start_date", { ascending: false })
  
  const formattedRequests = requests?.map(req => ({
    id: req.id,
    employeeName: "",
    startDate: formatDate(req.start_date),
    endDate: formatDate(req.end_date),
    daysCount: req.days_count,
    status: req.status
  })) || []
  
  // Calcular días disponibles
  const availableP
