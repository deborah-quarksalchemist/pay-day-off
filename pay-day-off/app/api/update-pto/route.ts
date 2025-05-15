import { createClient } from "@/lib/supabase/server";
import { calculateAccumulatedPDO } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación y rol de administrador
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener todos los empleados
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, hire_date, accumulated_pdo, used_pdo");

    if (employeesError) {
      throw employeesError;
    }

    // Actualizar PDO acumulados para cada empleado
    const updates = [];
    const currentDate = new Date();

    for (const employee of employees || []) {
      const calculatedPDO = calculateAccumulatedPDO(
        employee.hire_date,
        currentDate
      );

      // Solo actualizar si el valor calculado es diferente
      if (calculatedPDO !== employee.accumulated_pdo) {
        const { error } = await supabase
          .from("employees")
          .update({ accumulated_pdo: calculatedPDO })
          .eq("id", employee.id);

        if (error) {
          console.error(`Error al actualizar empleado ${employee.id}:`, error);
        } else {
          updates.push({
            id: employee.id,
            previous: employee.accumulated_pdo,
            new: calculatedPDO,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `PTO actualizados para ${updates.length} empleados`,
      updates,
    });
  } catch (error: any) {
    console.error("Error al actualizar PDO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
