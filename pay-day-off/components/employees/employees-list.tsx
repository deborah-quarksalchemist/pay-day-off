"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, RefreshCw, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { calculateAccumulatedPDO } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  hireDateRaw: string; // Fecha sin formatear para cálculos
  pdoBalance: string;
  accumulatedPdo: number;
  usedPdo: number;
}

interface EmployeesListProps {
  employees: Employee[];
}

export function EmployeesList({
  employees: initialEmployees,
}: EmployeesListProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  console.log(employees, "employees");
  const handleDelete = async (id: string) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }));

    try {
      // Primero eliminar el registro de empleado
      const { error: employeeError } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (employeeError) throw employeeError;

      // Luego eliminar el usuario
      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (userError) throw userError;

      // Actualizar la lista local
      setEmployees(employees.filter((emp) => emp.id !== id));

      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado exitosamente.",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description:
          error.message || "Ocurrió un error al eliminar el empleado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const refreshPDO = async () => {
    setIsRefreshing(true);

    try {
      // Actualizar PDO para todos los empleados
      const updatedEmployees = [...employees];

      for (let i = 0; i < updatedEmployees.length; i++) {
        const emp = updatedEmployees[i];
        const calculatedPDO = calculateAccumulatedPDO(emp.hireDateRaw);

        // Actualizar en la base de datos
        const { error } = await supabase
          .from("employees")
          .update({ accumulated_pdo: calculatedPDO })
          .eq("id", emp.id);

        if (error) {
          throw error;
        }

        // Actualizar en el estado local
        updatedEmployees[i] = {
          ...emp,
          accumulatedPdo: calculatedPDO,
          pdoBalance: (calculatedPDO - emp.usedPdo)?.toFixed(1),
        };
      }

      setEmployees(updatedEmployees);

      toast({
        title: "PTO actualizados",
        description: "Los PTO de todos los empleados han sido actualizados.",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar PTO",
        description: error.message || "Ocurrió un error al actualizar los PTO.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar empleados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/employees/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Empleado
          </Link>
        </Button>
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          {searchTerm
            ? "No se encontraron empleados que coincidan con la búsqueda."
            : "No hay empleados registrados."}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Fecha Contratación</TableHead>
                <TableHead>PTO Acumulados</TableHead>
                <TableHead>PTO Usados</TableHead>
                <TableHead>Balance PTO</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.hireDate}</TableCell>
                  <TableCell>{employee.accumulatedPdo?.toFixed(1)}</TableCell>
                  <TableCell>{employee.usedPdo?.toFixed(1)}</TableCell>
                  <TableCell className="font-medium">
                    {employee.pdoBalance}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/employees/${employee.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isLoading[employee.id]}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar empleado?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el
                              empleado y todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(employee.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
