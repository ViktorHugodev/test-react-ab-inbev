import React, { ReactElement, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeRole } from '@/types/employee';

// Create a mock AuthContext for testing
const AuthContext = createContext({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  canCreateRole: () => false
});

// Mock AuthProvider component
const MockAuthProvider = ({ children, mockRole = EmployeeRole.Leader }: { children: React.ReactNode, mockRole?: EmployeeRole }) => {
  // Mock implementation for testing purposes
  const mockLogin = jest.fn().mockImplementation(async () => {});
  const mockLogout = jest.fn();
  const mockCanCreateRole = jest.fn().mockImplementation(() => true);

  const value = {
    user: mockRole ? {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      role: mockRole
    } : null,
    isLoading: false,
    login: mockLogin,
    logout: mockLogout,
    canCreateRole: mockCanCreateRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mockRole?: EmployeeRole;
}

/**
 * Custom render function that wraps the component with necessary providers
 * @param ui - The React component to render
 * @param options - Custom render options including mockRole for AuthProvider
 * @returns The rendered component with user-event setup
 */
export function renderWithProviders(
  ui: ReactElement,
  { mockRole, ...options }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MockAuthProvider mockRole={mockRole}>
        {children}
      </MockAuthProvider>
    );
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent };
