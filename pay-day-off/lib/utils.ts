import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  differenceInBusinessDays,
  addDays,
  differenceInMonths,
  differenceInYears,
  isBefore,
} from "date-fns";
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

/**
 * Calcula los PDO acumulados basados en la fecha de contratación
 * @param hireDate Fecha de contratación
 * @param currentDate Fecha actual (por defecto es la fecha actual)
 * @returns Número de PDO acumulados
 */
export function calculateAccumulatedPDO(
  hireDate: Date | string,
  currentDate: Date = new Date()
): number {
  const hire = new Date(hireDate);

  // Si la fecha de contratación es posterior a la fecha actual, no hay PDO acumulados
  if (isBefore(currentDate, hire)) {
    return 0;
  }

  // Calcular meses completos trabajados (2 PDO por mes)
  const monthsWorked = differenceInMonths(currentDate, hire);
  const pdoFromMonths = monthsWorked * 2;

  // Calcular años completos trabajados (1 PDO adicional por año)
  const yearsWorked = differenceInYears(currentDate, hire);
  const pdoFromYears = yearsWorked;

  return pdoFromMonths + pdoFromYears;
}
