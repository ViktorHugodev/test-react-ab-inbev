import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/hooks/use-auth';
import { EmployeeRole } from '@/types/employee';

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
      <AuthProvider mockRole={mockRole}>
        {children}
      </AuthProvider>
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
