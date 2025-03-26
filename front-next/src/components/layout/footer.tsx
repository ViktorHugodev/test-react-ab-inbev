"use client";

import { useAuth } from "@/hooks/use-auth";

export function Footer() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AB InBev. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
