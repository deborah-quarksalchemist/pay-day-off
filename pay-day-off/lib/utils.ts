import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInBusinessDays, addDays } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr = "PPP") {
  return format(new Date(date), formatStr, { locale: es });
}

export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  // Ajustar para incluir el día final
  const adjustedEndDate = addDays(new Date(endDate), 1);

  // Calcular días laborables (excluyendo fines de semana)
  return differenceInBusinessDays(adjustedEndDate, new Date(startDate));
}

export function isAdmin(role?: string | null): boolean {
  return role === "admin";
}

export function isEmployee(role?: string | null): boolean {
  return role === "employee";
}
