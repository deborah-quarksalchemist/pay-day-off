import type React from "react";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/login");
      return null;
    }

    // Verificar si el usuario existe en la tabla users
    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error || !userData) {
      console.error("Error al verificar el usuario en el layout:", error);
      redirect("/login");
      return null;
    }
  } catch (error) {
    console.error("Error en el layout del dashboard:", error);
    redirect("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
