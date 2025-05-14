import { createClient } from "@supabase/supabase-js";

// Reemplaza estos valores con tus credenciales de Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sdplubdwpkswrcasnpjn.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGx1YmR3cGtzd3JjYXNucGpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI0MzY5NiwiZXhwIjoyMDYyODE5Njk2fQ.n76NYHdGOHLzXSdC0Em9JJu37b0u6h5qbm5j5U7Cw74";

async function debugSession() {
  try {
    // Crear cliente de Supabase con la clave de servicio
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Verificando usuarios autenticados...");

    // Obtener todos los usuarios de auth
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) throw authError;

    console.log(`Encontrados ${authUsers.users.length} usuarios en auth.users`);

    // Obtener todos los usuarios de la tabla users
    const { data: dbUsers, error: dbError } = await supabase
      .from("users")
      .select("id, email, full_name, role");

    if (dbError) throw dbError;

    console.log(
      `Encontrados ${dbUsers?.length || 0} usuarios en la tabla users`
    );

    // Verificar usuarios que están en auth pero no en la tabla users
    const missingUsers = authUsers.users.filter(
      (authUser) => !dbUsers?.some((dbUser) => dbUser.id === authUser.id)
    );

    if (missingUsers.length > 0) {
      console.log("\nUsuarios que están en auth pero no en la tabla users:");
      missingUsers.forEach((user) => {
        console.log(`- ${user.email} (${user.id})`);
      });

      // Preguntar si se desea crear estos usuarios en la tabla users
      console.log("\n¿Deseas crear estos usuarios en la tabla users? (s/n)");
      // Aquí iría código para leer la entrada del usuario, pero en este ejemplo simplemente mostramos cómo sería

      console.log(
        "\nPara crear manualmente un usuario en la tabla users, ejecuta:"
      );
      missingUsers.forEach((user) => {
        console.log(`
INSERT INTO users (id, email, full_name, role)
VALUES ('${user.id}', '${user.email}', '${
          user.user_metadata?.full_name || user.email
        }', 'admin');

INSERT INTO employees (id, hire_date, department, position, accumulated_pdo, used_pdo)
VALUES ('${user.id}', '${
          new Date().toISOString().split("T")[0]
        }', 'Administración', 'Administrador', 0, 0);
        `);
      });
    } else {
      console.log(
        "\nTodos los usuarios autenticados tienen registros en la tabla users."
      );
    }

    // Verificar roles de usuarios
    if (dbUsers && dbUsers.length > 0) {
      console.log("\nRoles de usuarios:");
      dbUsers.forEach((user) => {
        console.log(`- ${user.email}: ${user.role}`);
      });
    }
  } catch (error) {
    console.error("Error al depurar sesión:", error);
  }
}

debugSession();
