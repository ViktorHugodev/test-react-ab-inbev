import React, { ReactElement, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeRole } from '@/types/employee';


interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
  } | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  canCreateRole: (role: EmployeeRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  canCreateRole: () => false
});


const MockAuthProvider = ({ children, mockRole = EmployeeRole.Leader }: { children: React.ReactNode, mockRole?: EmployeeRole }) => {

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


interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mockRole?: EmployeeRole;
}


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


export * from '@testing-library/react';
export { userEvent };
