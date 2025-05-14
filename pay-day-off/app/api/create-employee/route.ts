// app/api/create-employee/route.ts
import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabaseAdmin = createClient<Database>(
  "https://sdplubdwpkswrcasnpjn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGx1YmR3cGtzd3JjYXNucGpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI0MzY5NiwiZXhwIjoyMDYyODE5Njk2fQ.n76NYHdGOHLzXSdC0Em9JJu37b0u6h5qbm5j5U7Cw74"
);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, fullName, department, position, hireDate } = body;

  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (authError) throw authError;

    const userId = authData.user.id;

    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      full_name: fullName,
      role: "employee",
    });

    if (userError) throw userError;

    const { error: employeeError } = await supabaseAdmin
      .from("employees")
      .insert({
        id: userId,
        department,
        position,
        hire_date: hireDate,
        accumulated_pdo: 0,
        used_pdo: 0,
      });

    if (employeeError) throw employeeError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
