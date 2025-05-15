"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, isAdmin } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  userRole?: string | null;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const mobile = useIsMobile();

  // Evitar hidratación incorrecta
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdminUser = isAdmin(userRole);

  const routes = [
    {
      href: isAdminUser ? "/dashboard/admin" : "/dashboard/employee",
      label: "Dashboard",
      icon: LayoutDashboard,
      active:
        pathname === "/dashboard/admin" || pathname === "/dashboard/employee",
    },
    ...(isAdminUser
      ? [
          {
            href: "/employees",
            label: "Empleados",
            icon: Users,
            active:
              pathname === "/employees" || pathname.startsWith("/employees/"),
          },
        ]
      : []),
    {
      href: "/calendar",
      label: "Calendario",
      icon: Calendar,
      active: pathname === "/calendar",
    },
    {
      href: "/my-pdo",
      label: "Mis días libres",
      icon: Clock,
      active: pathname === "/my-pdo" || pathname.startsWith("/my-pdo/"),
    },
  ];

  if (!isMounted) {
    return null;
  }

  const sidebarContent = (
    <div
      className={cn(
        "h-full flex flex-col",
        isCollapsed ? "items-center" : "px-3"
      )}
    >
      <div
        className={cn(
          "flex items-center py-4",
          isCollapsed ? "justify-center" : "justify-between px-2"
        )}
      >
        {!isCollapsed && (
          <div className="text-lg font-bold">Gestión Empleados</div>
        )}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pt-4">
        <nav className="flex flex-col space-y-2 px-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={route.active ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : ""
              )}
              size={isCollapsed ? "icon" : "default"}
            >
              <Link href={route.href}>
                <route.icon
                  className={cn("h-4 w-4", isCollapsed ? "m-0" : "mr-2")}
                />
                {!isCollapsed && route.label}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  // Versión móvil con Sheet (panel deslizable)
  if (mobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Versión escritorio
  return (
    <div
      className={cn(
        "hidden lg:block border-r transition-all",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {sidebarContent}
    </div>
  );
}
