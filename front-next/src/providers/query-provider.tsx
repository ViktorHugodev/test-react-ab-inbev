"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        
        
        staleTime: 60 * 1000, 
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}


let browserQueryClient: QueryClient | undefined = undefined;


const getQueryClient = () => {
  
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  
  
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  
  return browserQueryClient;
};

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}