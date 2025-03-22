"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg glass-container">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Registre-se para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
