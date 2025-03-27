import React, { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginContent from "./login-content";
import { LoadingIndicator } from "@/components/shared/loading/loading-indicator";


export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg glass-container">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">AB InBev</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingIndicator />}>
            <LoginContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
