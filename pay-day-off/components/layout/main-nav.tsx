"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/utils"

interface MainNavProps {
  userRole?: string | null
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname()

  const isAdminUser = isAdmin(userRole)

  const routes = [
    {
      href: isAdminUser ? "/dashboard/admin" : "/dashboard/employee",
      label: "Dashboard",
      active: pathname === "/dashboard/admin" || pathname === "/dashboard/employee",
    },
    {
      href: "/calendar",
      label: "Calendario",
      active: pathname === "/calendar",
    },
    ...(isAdminUser
      ? [
          {
            href: "/employees",
            label: "Empleados",
            active: pathname === "/employees" || pathname.startsWith("/employees/"),
          },
        ]
      : []),
    {
      href: "/my-pdo",
      label: "Mis días libres",
      active: pathname === "/my-pdo",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Button
          key={route.href}
          asChild
          variant={route.active ? "default" : "ghost"}
          className={cn(
            "text-sm font-medium transition-colors",
            route.active ? "" : "text-muted-foreground hover:text-primary",
          )}
        >
          <Link href={route.href}>{route.label}</Link>
        </Button>
      ))}
    </nav>
  )
}
