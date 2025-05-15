"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, calculateBusinessDays } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { es } from "date-fns/locale";

interface PdoRequestFormProps {
  availablePdo: number;
}

export function PdoRequestForm({ availablePdo }: PdoRequestFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [daysCount, setDaysCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Calcular días cuando cambian las fechas
  useEffect(() => {
    if (startDate && endDate) {
      if (isBefore(endDate, startDate)) {
        setEndDate(startDate);
      }

      const days = calculateBusinessDays(startDate, endDate);
      setDaysCount(days);
    } else {
      setDaysCount(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Debes seleccionar las fechas de inicio y fin",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (daysCount <= 0) {
      toast({
        title: "Error",
        description: "El período seleccionado no incluye días laborables",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (daysCount > availablePdo) {
      toast({
        title: "Error",
        description:
          "No tienes suficientes días disponibles para esta solicitud",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const { error: requestError } = await supabase
        .from("pdo_requests")
        .insert({
          employee_id: userData.user.id,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          days_count: daysCount,
          status: "pending",
          notes: notes || null,
        });

      if (requestError) throw requestError;

      toast({
        title: "Solicitud enviada",
        description:
          "Tu solicitud de días libres ha sido enviada exitosamente.",
      });

      router.push("/my-pdo");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Ocurrió un error al enviar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Deshabilitar fechas pasadas
  const disabledDays = {
    before: new Date(),
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={disabledDays}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={!startDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={{
                      ...disabledDays,
                      before: startDate || new Date(),
                    }}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles adicionales sobre tu solicitud"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span>Días solicitados:</span>
                <span className="font-medium">{daysCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Días disponibles:</span>
                <span className="font-medium">{availablePdo?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Días restantes después de esta solicitud:</span>
                <span
                  className={cn(
                    "font-medium",
                    availablePdo - daysCount < 0 ? "text-red-500" : ""
                  )}
                >
                  {(availablePdo - daysCount)?.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/my-pdo")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || daysCount <= 0 || daysCount > availablePdo}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
