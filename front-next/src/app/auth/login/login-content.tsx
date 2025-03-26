"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/shared/forms/login-form";
import { toast } from "sonner";

export default function LoginContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [formReady, setFormReady] = useState(false);

  // Otimização para renderização mais rápida
  useEffect(() => {
    // Marcar formulário como pronto após a primeira renderização
    if (!formReady) {
      setFormReady(true);
    }
    
    // Se já estiver autenticado, redireciona para a página inicial ou callback
    if (!isLoading && user) {
      // Forçar redirecionamento para dashboard quando já estiver autenticado
      setTimeout(() => {
        router.push(callbackUrl === "/" ? "/dashboard" : callbackUrl);
      }, 300);
    }

    // Exibe mensagem de erro se houver
    if (error) {
      toast.error(error);
    }
  }, [user, isLoading, router, error, callbackUrl, formReady]);

  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return <LoginForm variant="card" />;
}
