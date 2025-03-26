import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/providers/query-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import { Toaster } from "sonner";
import { TokenSync } from "@/components/shared/auth/token-sync";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
    <html lang="pt-BR" className="antialiased" suppressHydrationWarning>
      <body
        className={`${poppins.variable} min-h-screen bg-background font-sans text-foreground`}
      >
        <ReduxProvider>
          <QueryProvider>
            <AuthProvider>
              {/* Componente para sincronizar o token entre localStorage e cookies */}
              <TokenSync>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </TokenSync>
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
        </ReduxProvider>
      </body>
    </html>
  );
}