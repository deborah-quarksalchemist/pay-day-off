"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, calculateAccumulatedPDO } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface EmployeeFormProps {
  employeeId?: string;
  defaultValues?: {
    fullName: string;
    email: string;
    department: string;
    position: string;
    hireDate: Date;
  };
}

export function EmployeeForm({ employeeId, defaultValues }: EmployeeFormProps) {
  const [fullName, setFullName] = useState(defaultValues?.fullName || "");
  const [email, setEmail] = useState(defaultValues?.email || "");
  const [department, setDepartment] = useState(defaultValues?.department || "");
  const [position, setPosition] = useState(defaultValues?.position || "");
  const [hireDate, setHireDate] = useState<Date | undefined>(
    defaultValues?.hireDate || new Date()
  );
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedPDO, setCalculatedPDO] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const isEditing = !!employeeId;

  // Calcular PDO cuando cambia la fecha de contratación
  useEffect(() => {
    if (hireDate) {
      const pdo = calculateAccumulatedPDO(hireDate);
      setCalculatedPDO(pdo);
    }
  }, [hireDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!hireDate) {
      toast({
        title: "Error",
        description: "La fecha de contratación es obligatoria",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing) {
        // Actualizar usuario existente
        const { error: userError } = await supabase
          .from("users")
          .update({
            full_name: fullName,
            email,
          })
          .eq("id", employeeId);

        if (userError) throw userError;

        const { error: employeeError } = await supabase
          .from("employees")
          .update({
            department,
            position,
            hire_date: format(hireDate, "yyyy-MM-dd"),
            accumulated_pdo: calculatedPDO,
          })
          .eq("id", employeeId);

        if (employeeError) throw employeeError;

        toast({
          title: "Empleado actualizado",
          description:
            "Los datos del empleado han sido actualizados exitosamente.",
        });
      } else {
        // Crear nuevo usuario vía API protegida
        const response = await fetch("/api/create-employee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: password || Math.random().toString(36).slice(-8),
            fullName,
            department,
            position,
            hireDate: format(hireDate, "yyyy-MM-dd"),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al crear el empleado.");
        }

        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado exitosamente.",
        });
      }

      router.push("/employees");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Ocurrió un error al procesar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Fecha de contratación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="hireDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !hireDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {hireDate ? (
                      format(hireDate, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={hireDate}
                    onSelect={setHireDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground mt-2">
                PTO calculados:{" "}
                <span className="font-medium">{calculatedPDO?.toFixed(1)}</span>{" "}
                días
              </p>
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña (opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar en blanco para generar automáticamente"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employees")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Actualizando..." : "Creando..."}
                </>
              ) : isEditing ? (
                "Actualizar Empleado"
              ) : (
                "Crear Empleado"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
