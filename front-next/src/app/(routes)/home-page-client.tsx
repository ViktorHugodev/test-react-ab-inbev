"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Users, LayoutDashboard, Building } from "lucide-react";

export default function HomePageClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">Bem-vindo ao Sistema de Gerenciamento de Funcionários</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Use as opções abaixo para gerenciar os funcionários da empresa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm">
            <LayoutDashboard className="h-10 w-10 text-primary" />
            <h3 className="font-medium text-lg">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Visualize os dados gerais e estatísticas do sistema.
            </p>
            <div className="mt-auto pt-4">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Ver Dashboard</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm">
            <Users className="h-10 w-10 text-primary" />
            <h3 className="font-medium text-lg">Gerenciar Funcionários</h3>
            <p className="text-sm text-muted-foreground">
              Adicione, edite ou remova funcionários do sistema.
            </p>
            <div className="mt-auto pt-4">
              <Link href="/employees/create" className="w-full">
                <Button className="w-full">Cadastrar Funcionário</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm">
            <Building className="h-10 w-10 text-primary" />
            <h3 className="font-medium text-lg">Departamentos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie os departamentos da empresa.
            </p>
            <div className="mt-auto pt-4">
              <Link href="/departments" className="w-full">
                <Button className="w-full" variant="outline">Gerenciar Departamentos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
