"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/shared/forms/login-form";
import { toast } from "sonner";
import { LoadingIndicator } from '@/components/shared/loading/loading-indicator';

export default function LoginContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [formReady, setFormReady] = useState(false);

  
  useEffect(() => {
    
    if (!formReady) {
      setFormReady(true);
    }
    
    
    if (!isLoading && user) {
      
      setTimeout(() => {
        router.push(callbackUrl === "/" ? "/dashboard" : callbackUrl);
      }, 300);
    }

    
    if (error) {
      toast.error(error);
    }
  }, [user, isLoading, router, error, callbackUrl, formReady]);

  if (isLoading) {
    return <LoadingIndicator />
  }

  return <LoginForm variant="card" />;
}
