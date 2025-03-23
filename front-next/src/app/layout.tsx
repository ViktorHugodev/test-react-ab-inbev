import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { TokenSyncClient } from "@/components/auth/token-sync-client";
import { ConditionalHeader } from "@/components/layout/conditional-header";
import { ConditionalFooter } from "@/components/layout/conditional-footer";

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
            {/* Componente para sincronizar o token entre localStorage e cookies */}
            <TokenSyncClient />
            
            <div className="relative flex min-h-screen flex-col">
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
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