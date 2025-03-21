// Base API client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5244/api';

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  post: async <T>(path: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  put: async <T>(path: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  delete: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T; // No content
    }

    return response.json();
  },
};