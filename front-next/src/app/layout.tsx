import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "AB InBev - Sistema de Gerenciamento",
  description: "Sistema de gerenciamento de funcionários da AB InBev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body
        className={`${poppins.variable} min-h-screen bg-background font-sans text-foreground`}
      >
        <QueryProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6 lg:px-8">
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} AB InBev. Todos os direitos reservados.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster 
              position="top-center" 
              richColors 
              toastOptions={{
                style: { 
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))'
                }
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}