"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface PdoRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: string;
}

interface PdoRequestsListProps {
  requests: PdoRequest[];
  isAdmin: boolean;
}

export function PdoRequestsList({ requests, isAdmin }: PdoRequestsListProps) {
  console.log(requests, "requests");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const { error } = await supabase
        .from("pdo_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      // Si se aprueba, actualizar los días utilizados
      if (status === "approved") {
        const { data: request } = await supabase
          .from("pdo_requests")
          .select("employee_id, days_count")
          .eq("id", id)
          .single();

        if (request) {
          const { data: employee } = await supabase
            .from("employees")
            .select("used_pdo")
            .eq("id", request.employee_id)
            .single();

          if (employee) {
            await supabase
              .from("employees")
              .update({ used_pdo: employee.used_pdo + request.days_count })
              .eq("id", request.employee_id);
          }
        }
      }

      toast({
        title: `Solicitud ${status === "approved" ? "aprobada" : "rechazada"}`,
        description: `La solicitud ha sido ${
          status === "approved" ? "aprobada" : "rechazada"
        } exitosamente.`,
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Ocurrió un error al procesar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            Pendiente
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            Rechazada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        No hay solicitudes para mostrar.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isAdmin && <TableHead>Empleado</TableHead>}
          <TableHead>Fecha Inicio</TableHead>
          <TableHead>Fecha Fin</TableHead>
          <TableHead>Días</TableHead>
          <TableHead>Estado</TableHead>
          {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            {isAdmin && (
              <TableCell className="font-medium">
                {request.employeeName}
              </TableCell>
            )}
            <TableCell>{request.startDate}</TableCell>
            <TableCell>{request.endDate}</TableCell>
            <TableCell>{request.daysCount}</TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            {isAdmin && request.status === "pending" && (
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateStatus(request.id, "approved")}
                    disabled={isLoading[request.id]}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isLoading[request.id]}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Rechazar solicitud?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La solicitud será
                          rechazada.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleUpdateStatus(request.id, "rejected")
                          }
                        >
                          Rechazar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            )}
            {isAdmin && request.status !== "pending" && (
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground">Procesada</span>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
