import { createClient } from "@supabase/supabase-js";

// Reemplaza estos valores con tus credenciales de Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sdplubdwpkswrcasnpjn.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGx1YmR3cGtzd3JjYXNucGpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI0MzY5NiwiZXhwIjoyMDYyODE5Njk2fQ.n76NYHdGOHLzXSdC0Em9JJu37b0u6h5qbm5j5U7Cw74";

// Datos del usuario administrador
const adminEmail = "deborah.sanchez1993@gmail.com";
const adminPassword = "123456";
const adminName = "Deborah Sanchez";

async function createAdminUser() {
  try {
    // Crear cliente de Supabase con la clave de servicio para tener permisos completos
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Creando usuario administrador...");

    // 1. Crear usuario en auth.users
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminName },
      });

    if (authError) throw authError;

    console.log("Usuario creado en auth:", authData.user.id);

    // 2. Insertar en la tabla users
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: adminEmail,
      full_name: adminName,
      role: "admin",
    });

    if (userError) throw userError;

    console.log("Usuario insertado en tabla users");

    // 3. Insertar en la tabla employees
    const { error: employeeError } = await supabase.from("employees").insert({
      id: authData.user.id,
      hire_date: new Date().toISOString().split("T")[0],
      department: "Administración",
      position: "Administrador",
      accumulated_pdo: 0,
      used_pdo: 0,
    });

    if (employeeError) throw employeeError;

    console.log("Usuario insertado en tabla employees");

    console.log("¡Usuario administrador creado exitosamente!");
  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
  }
}

createAdminUser();
