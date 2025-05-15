import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  try {
    // Obtener el rol del usuario
    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();
    console.log({ session, userData });
    // Si hay un error o no hay datos, redirigir al login
    if (error || !userData) {
      console.error("Error al obtener el rol del usuario:", error);
      // Redirigir al login en lugar de entrar en un loop
      redirect("/login");
      return null;
    }

    if (userData.role === "admin") {
      redirect("/dashboard/admin");
    } else if (userData.role === "employee") {
      redirect("/dashboard/employee");
    } else {
      // Si el rol no es reconocido, redirigir al login
      redirect("/login");
    }
  } catch (error) {
    console.error("Error en la página principal:", error);
    redirect("/login");
  }

  return null;
}
