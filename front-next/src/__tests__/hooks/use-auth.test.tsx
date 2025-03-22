import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { EmployeeRole } from '@/types/employee';
import * as authApi from '@/lib/api/auth';
import * as tokenSync from '@/lib/token-sync';

// Tipo parcial para o Employee nos testes
type PartialEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  documentNumber?: string;
  birthDate?: string;
  department?: string;
  phoneNumbers?: Array<{ id?: string; number: string; type: number }>;
};

// Mock the auth API and token sync modules
jest.mock('@/lib/api/auth', () => ({
  loginUser: jest.fn(),
  getCurrentUser: jest.fn()
}));

jest.mock('@/lib/token-sync', () => ({
  clearAuthToken: jest.fn()
}));

jest.mock('js-cookie', () => ({
  set: jest.fn(),
  remove: jest.fn()
}));

const mockLoginUser = authApi.loginUser as jest.MockedFunction<typeof authApi.loginUser>;
const mockGetCurrentUser = authApi.getCurrentUser as jest.MockedFunction<typeof authApi.getCurrentUser>;
const mockClearAuthToken = tokenSync.clearAuthToken as jest.MockedFunction<typeof tokenSync.clearAuthToken>;

describe('useAuth Hook', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  // Test wrapper component for the hook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with null user and loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should successfully login a user', async () => {
    // Mock successful login response
    const mockEmployee: PartialEmployee = {
      id: '123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: EmployeeRole.Leader,
      documentNumber: '12345678900',
      birthDate: new Date('1990-01-01').toISOString(),
      department: 'TI',
      phoneNumbers: [{ id: '1', number: '11999999999', type: 1 }]
    };
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    // Verify user is set correctly
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.role).toBe(EmployeeRole.Leader);
    
    // Verify token was stored
    expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('should handle login errors', async () => {
    // Mock failed login
    mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let error: Error | undefined;
    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrongpassword');
      } catch (e) {
        error = e as Error;
      }
    });
    
    // Should throw error
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('Invalid credentials');
    
    // User should remain null
    expect(result.current.user).toBeNull();
  });

  it('should logout a user', async () => {
    // Setup initial logged in state
    const mockEmployee: PartialEmployee = {
      id: '123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: EmployeeRole.Leader,
      documentNumber: '12345678900',
      birthDate: new Date('1990-01-01').toISOString(),
      department: 'TI',
      phoneNumbers: [{ id: '1', number: '11999999999', type: 1 }]
    };
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    // Verify user is null and token was cleared
    expect(result.current.user).toBeNull();
    expect(mockClearAuthToken).toHaveBeenCalled();
  });

  it('should check role permissions correctly', async () => {
    // Setup initial logged in state with Leader role
    const mockEmployee: PartialEmployee = {
      id: '123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: EmployeeRole.Leader,
      documentNumber: '12345678900',
      birthDate: new Date('1990-01-01').toISOString(),
      department: 'TI',
      phoneNumbers: [{ id: '1', number: '11999999999', type: 1 }]
    };
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    // Check permissions
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(false);
  });

  it('should load user from token on mount', async () => {
    // Mock localStorage to return a token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    // Mock getCurrentUser response
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Leader',
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verify user is loaded from token
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
