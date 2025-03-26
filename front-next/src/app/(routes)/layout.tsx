import type { Metadata } from "next";
import { Toaster } from "sonner";
import { WelcomeDialog } from "@/components/shared/onboarding/welcome-dialog";

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
    <>
      {children}
      <WelcomeDialog />
      <Toaster position="top-center" richColors />
    </>
  );
}