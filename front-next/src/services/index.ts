// Base API client with clean architecture principles

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5244/api';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const api = {
  get: async <T>(path: string): Promise<T> => {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        console.error("API Error Response:", JSON.stringify(errorData));
        const errorMessage = errorData.message || errorData.details || errorData.error || `API Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status, errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
  },

  post: async <T>(path: string, data: unknown): Promise<T> => {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        console.error("API Error Response:", JSON.stringify(errorData));
        const errorMessage = errorData.message || errorData.details || errorData.error || `API Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status, errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
  },

  put: async <T>(path: string, data: unknown): Promise<T> => {
    try {
      console.log("PUT request to:", `${API_URL}${path}`);
      console.log("Data:", JSON.stringify(data));
      
      const response = await fetch(`${API_URL}${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        console.error("API Error Response:", JSON.stringify(errorData));
        const errorMessage = errorData.message || errorData.details || errorData.error || `API Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status, errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
  },

  patch: async <T>(path: string, data: unknown): Promise<T> => {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        throw new ApiError(error.message || `API Error: ${response.status}`, response.status, error);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
  },

  delete: async <T>(path: string): Promise<T> => {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        throw new ApiError(error.message || `API Error: ${response.status}`, response.status, error);
      }

      if (response.status === 204) {
        return {} as T; // No content
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
  },
};