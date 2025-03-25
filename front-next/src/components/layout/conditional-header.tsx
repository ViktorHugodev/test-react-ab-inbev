"use client";

import { useAuth } from "@/hooks/use-auth";
import { Header } from "./header";

export function ConditionalHeader() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return <Header />;
}
