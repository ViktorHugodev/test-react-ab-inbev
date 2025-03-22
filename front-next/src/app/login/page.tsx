"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  useEffect(() => {
    // Redireciona para a nova rota de login mantendo os parâmetros de query
    const url = new URL('/auth/login', window.location.origin);
    
    // Preserva os parâmetros de query
    if (callbackUrl) {
      url.searchParams.set('callbackUrl', callbackUrl);
    }
    
    if (error) {
      url.searchParams.set('error', error);
    }
    
    router.replace(url.toString());
  }, [router, callbackUrl, error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecionando...
    </div>
  );
}