"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import Link from 'next/link';

function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex h-14 items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AB InBev. Todos os direitos reservados.
        </p>
        <div className="hidden md:flex gap-4">
          <Link
            href="#"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Termos
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver autenticado, redireciona para o login
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Não renderiza o layout protegido se não estiver autenticado
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/50">{children}</main>
      <Footer />
    </div>
  );
}