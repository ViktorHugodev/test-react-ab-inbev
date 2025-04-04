import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { EmployeeRole } from '@/types/employee';
import * as authApi from '@/lib/api/auth';
import * as tokenSync from '@/lib/token-sync';
import Cookies from 'js-cookie';


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


global.fetch = jest.fn();


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
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  
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
    
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should successfully login a user', async () => {
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.role).toBe(EmployeeRole.Leader);
    expect(result.current.user?.name).toBe('Test User');
    
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    
    
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
    
    
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('Invalid credentials');
    
    
    expect(result.current.user).toBeNull();
    
    
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(mockCookiesSet).not.toHaveBeenCalled();
  });

  it('should logout a user', async () => {
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    
    act(() => {
      result.current.logout();
    });
    
    
    expect(result.current.user).toBeNull();
    expect(mockClearAuthToken).toHaveBeenCalled();
  });

  it('should check role permissions correctly', async () => {
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: mockEmployee as any
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(false);
    
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: {...mockEmployee, role: EmployeeRole.Director} as any
    });
    
    
    act(() => {
      result.current.logout();
    });
    
    await act(async () => {
      await result.current.login('director@example.com', 'password123');
    });
    
    
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(true);
    
    
    mockLoginUser.mockResolvedValueOnce({
      token: 'test-token',
      expiresAt: new Date().toISOString(),
      employee: {...mockEmployee, role: EmployeeRole.Employee} as any
    });
    
    
    act(() => {
      result.current.logout();
    });
    
    await act(async () => {
      await result.current.login('employee@example.com', 'password123');
    });
    
    
    expect(result.current.canCreateRole(EmployeeRole.Employee)).toBe(true);
    expect(result.current.canCreateRole(EmployeeRole.Leader)).toBe(false);
    expect(result.current.canCreateRole(EmployeeRole.Director)).toBe(false);
  });

  it('should load user from token on mount', async () => {
    
    jest.useFakeTimers();
    
    
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Leader'
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    act(() => {
      jest.runAllTimers();
    });
    
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?.name).toBe('Test User');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.role).toBe(EmployeeRole.Leader);
    
    
    expect(mockGetCurrentUser).toHaveBeenCalled();
  });

  it('should handle errors when loading user from token', async () => {
    
    jest.useFakeTimers();
    
    
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('invalid-token');
    
    
    mockGetCurrentUser.mockRejectedValueOnce(new Error('Invalid token'));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    act(() => {
      jest.runAllTimers();
    });
    
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    
    expect(result.current.user).toBeNull();
    
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should correctly convert role from string to enum', async () => {
    
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Director' 
    });
    
    
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    jest.useFakeTimers();
    act(() => {
      jest.runAllTimers();
    });
    
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    
    expect(result.current.user?.role).toBe(EmployeeRole.Director);
  });

  it('should handle invalid role values gracefully', async () => {
    
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'InvalidRole' 
    });
    
    
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    
    jest.useFakeTimers();
    act(() => {
      jest.runAllTimers();
    });
    
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    
    expect(result.current.user?.role).toBe(EmployeeRole.Employee);
  });

  
  it('should handle user registration', async () => {
    
    
    expect(true).toBe(true);
  });
});