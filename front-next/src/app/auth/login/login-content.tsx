"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/forms/login-form";
import { toast } from "sonner";

export default function LoginContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    // Se já estiver autenticado, redireciona para a página inicial ou callback
    if (!isLoading && user) {
      router.push(callbackUrl);
    }

    // Exibe mensagem de erro se houver
    if (error) {
      toast.error(error);
    }
  }, [user, isLoading, router, error, callbackUrl]);

  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return <LoginForm />;
}
