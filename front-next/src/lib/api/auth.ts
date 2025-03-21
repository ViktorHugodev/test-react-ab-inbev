import { api } from "@/services/api";
import { AuthResponseDTO, LoginDTO } from "@/types/employee";

// Simula um erro de rede ou servidor
const simulateNetworkDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function loginUser(credentials: LoginDTO): Promise<AuthResponseDTO> {
  try {
    // Em desenvolvimento, podemos usar o backend real ou o mock
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await simulateNetworkDelay(Math.floor(Math.random() * 500) + 300);
      
      // Mock para desenvolvimento
      if (credentials.email === "test@example.com" && credentials.password === "password123") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas depois
        
        return {
          token: "mock-jwt-token",
          expiresAt: expiresAt.toISOString(),
          employee: {
            id: "123",
            firstName: "Usuário",
            lastName: "Teste",
            fullName: "Usuário Teste",
            email: credentials.email,
            documentNumber: "12345678900",
            birthDate: new Date("1990-01-01"),
            age: 33,
            role: 2, // Leader
            department: "TI",
            phoneNumbers: [
              { id: "1", number: "11999999999", type: 1 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }
      
      throw new Error("Email ou senha inválidos");
    }
    
    // Chamada real para o backend
    return await api.post<AuthResponseDTO>("/Auth/login", credentials);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    // Em desenvolvimento, podemos usar o backend real ou o mock
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await simulateNetworkDelay(Math.floor(Math.random() * 300) + 200);
      
      return {
        id: "123",
        email: "test@example.com",
        name: "Usuário Teste",
        role: "Leader"
      };
    }
    
    return await api.get<CurrentUserResponse>("/Auth/me");
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    throw error;
  }
}