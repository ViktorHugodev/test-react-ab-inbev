"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Usando uma função factory para criar um novo cliente para cada requisição de servidor
// Isso evita o compartilhamento de estado entre usuários no SSR
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Durante a exibição inicial, mostramos dados em cache ou placeholder
        // enquanto os dados são carregados no lado do cliente
        staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}

// Esta instância pode ser diferente no lado cliente e servidor
let browserQueryClient: QueryClient | undefined = undefined;

// Obter o cliente para o ambiente atual (cliente ou servidor)
const getQueryClient = () => {
  // No servidor, sempre crie um novo cliente
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  
  // No cliente, reutilize o mesmo cliente
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  
  return browserQueryClient;
};

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Usar o cliente adequado para o ambiente atual
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}