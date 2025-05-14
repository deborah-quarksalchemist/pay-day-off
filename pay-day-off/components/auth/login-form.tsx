"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Modificar la función handleSubmit para manejar mejor la redirección
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Verificar si el usuario existe en la tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError || !userData) {
        // Si el usuario no existe en la tabla users, mostrar un error
        toast({
          title: "Error de acceso",
          description:
            "Tu cuenta existe pero no tiene permisos asignados. Contacta al administrador.",
          variant: "destructive",
        });
        // Cerrar sesión para evitar el loop
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente",
      });

      // Redirigir directamente según el rol en lugar de ir a la página principal
      if (userData.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/employee");
      }

      // Esperar un momento antes de refrescar para asegurar que la sesión se establezca
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Ocurrió un error al iniciar sesión",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </form>
  );
}
