"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  href?: string;
}

export function BackButton({ label = "Volver", href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="justify-start p-0 h-9"
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}
