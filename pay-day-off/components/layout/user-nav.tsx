"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { LogOut } from "lucide-react"

interface UserNavProps {
  user: {
    id: string
    email: string
    full_name: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
      router.push("/login")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button className="w-full cursor-pointer" onClick={handleSignOut} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
