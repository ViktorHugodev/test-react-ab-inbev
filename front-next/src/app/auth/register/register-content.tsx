"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Funcionalidade de registro em desenvolvimento.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Por favor, entre em contato com o administrador do sistema para criar uma conta.
      </p>
      <Link href="/auth/login">
        <Button className="w-full">Voltar para o Login</Button>
      </Link>
    </div>
  );
}
