"use client";

import { useAuth } from "@/hooks/use-auth";
import { Header } from "./header";

export function ConditionalHeader() {
  const { user } = useAuth();
  
  // Only render the header if the user is authenticated
  if (!user) {
    return null;
  }
  
  return <Header />;
}
