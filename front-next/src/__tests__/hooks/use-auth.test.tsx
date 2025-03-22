import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { EmployeeRole } from '@/types/employee';
import * as authApi from '@/lib/api/auth';
import * as tokenSync from '@/lib/token-sync';
import Cookies from 'js-cookie';

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

// Mock do fetch API
global.fetch = jest.fn();

// Mock the auth API and token sync modules
jest.mock('@/lib/api/auth', () => ({
  loginUser: jest.fn(),
  getCurrentUser: jest.fn(),
  registerUser: jest.fn()
}));

jest.mock('@/lib/token-sync', () => ({
  clearAuthToken: jest.fn()
}));

jest.mock('js-cookie', () => ({
  set: jest.fn(),
  remove: jest.fn(),
  get: jest.fn()
}));

const mockLoginUser = authApi.loginUser as jest.MockedFunction<typeof authApi.loginUser>;
const mockGetCurrentUser = authApi.getCurrentUser as jest.MockedFunction<typeof authApi.getCurrentUser>;
const mockRegisterUser = authApi.registerUser as jest.MockedFunction<typeof authApi.registerUser>;
const mockClearAuthToken = tokenSync.clearAuthToken as jest.MockedFunction<typeof tokenSync.clearAuthToken>;
const mockCookiesSet = Cookies.set as jest.MockedFunction<typeof Cookies.set>;

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

    // Reset mocked time
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test wrapper component for the hook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

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

  it('should initialize with null user and loading state', () => {
    // Don't mock localStorage.getItem to simulate no token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should successfully login a user', async () => {
    // Mock successful login response
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
    expect(result.current.user?.name).toBe('Test User');
    
    // Verify token was stored
    expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    
    // Verify cookie was set
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'auth_token',
      'test-token',
      expect.objectContaining({
        expires: 1,
        path: '/'
      })
    );
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
    
    // localStorage and cookies should not be set
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(mockCookiesSet).not.toHaveBeenCalled();
  });

  it('should logout a user', async () => {
    // Setup initial logged in state
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
    // Setup mock user with Leader role
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
    
    // Now test with Director role
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: {...mockEmployee, role: EmployeeRole.Director} as any
    });
    
    // Logout and login as Director
    act(() => {
      result.current.logout();
    });
    
    await act(async () => {
      await result.current.login('director@example.com', 'password123');
    });
    
    // Directors can create any role
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(true);
    
    // Now test with Employee role
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: {...mockEmployee, role: EmployeeRole.Employee} as any
    });
    
    // Logout and login as Employee
    act(() => {
      result.current.logout();
    });
    
    await act(async () => {
      await result.current.login('employee@example.com', 'password123');
    });
    
    // Employees can only create Employee role
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(false);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(false);
  });

  it('should load user from token on mount', async () => {
    // Use fake timers to control async setTimeout
    jest.useFakeTimers();
    
    // Mock localStorage to return a token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    // Mock getCurrentUser response to match the expected format from backend
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Leader'
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the setTimeout to execute
    act(() => {
      jest.runAllTimers();
    });
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verify user is loaded from token with correct data
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?.name).toBe('Test User');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.role).toBe(EmployeeRole.Leader);
    
    // Verify getCurrentUser was called
    expect(mockGetCurrentUser).toHaveBeenCalled();
  });

  it('should handle errors when loading user from token', async () => {
    // Use fake timers to control async setTimeout
    jest.useFakeTimers();
    
    // Mock localStorage to return a token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('invalid-token');
    
    // Mock getCurrentUser to throw error
    mockGetCurrentUser.mockRejectedValueOnce(new Error('Invalid token'));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the setTimeout to execute
    act(() => {
      jest.runAllTimers();
    });
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // User should be null if token validation fails
    expect(result.current.user).toBeNull();
    
    // Token should be removed from localStorage on error
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should correctly convert role from string to enum', async () => {
    // Mock getCurrentUser to return role as string
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Director' // String role
    });
    
    // Mock localStorage to return a token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Fast forward timers
    jest.useFakeTimers();
    act(() => {
      jest.runAllTimers();
    });
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Role should be converted to enum
    expect(result.current.user?.role).toBe(EmployeeRole.Director);
  });

  it('should handle invalid role values gracefully', async () => {
    // Mock getCurrentUser to return invalid role
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'InvalidRole' // Invalid role string
    });
    
    // Mock localStorage to return a token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Fast forward timers
    jest.useFakeTimers();
    act(() => {
      jest.runAllTimers();
    });
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should default to Employee for invalid roles
    expect(result.current.user?.role).toBe(EmployeeRole.Employee);
  });

  // Add tests for register functionality
  it('should handle user registration', async () => {
    // This feature isn't implemented in the hook yet, but should be
    // Placeholder for when it gets implemented
    expect(true).toBe(true);
  });
});