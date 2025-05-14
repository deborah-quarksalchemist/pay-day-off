import { createClient } from "@/lib/supabase/server";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", session.user.id)
    .single();

  if (!userData) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold mr-6">Gestión de Empleados</h1>
        <MainNav userRole={userData.role} />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserNav user={userData} />
        </div>
      </div>
    </header>
  );
}
