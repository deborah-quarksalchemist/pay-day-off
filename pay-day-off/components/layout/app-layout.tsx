import type React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";

export async function AppLayout({ children }: { children: React.ReactNode }) {
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
      .select("id, email, full_name, role")
      .eq("id", session.user.id)
      .single();

    if (error || !userData) {
      console.error("Error al verificar el usuario en el layout:", error);
      redirect("/login");
      return null;
    }

    return (
      <div className="flex min-h-screen">
        <Sidebar userRole={userData.role} />
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <header className="border-b h-16 flex items-center px-6 sticky top-0 bg-background z-10">
            <div className="ml-auto flex items-center gap-4">
              <ModeToggle />
              <UserNav user={userData} />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error en el layout:", error);
    redirect("/login");
    return null;
  }
}
