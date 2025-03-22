import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { renderWithProviders } from '@/test/utils/test-utils';

// Mock dependencies
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('LoginForm', () => {
  // Setup mocks
  const mockLogin = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth hook
    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false
    });
    
    // Mock useRouter
    useRouter.mockReturnValue({
      push: mockPush
    });
  });
  
  it('calls login function with correct credentials when submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill form with valid data
    const emailInput = screen.getByLabelText('E-mail');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Verify login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  it('shows success toast and redirects on successful login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);
    
    // Fill and submit form
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify success handling
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('shows error toast on login failure', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Mock login failure
    const errorMessage = 'Email ou senha inválidos';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    // Fill and submit form
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Senha'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
  
  it('disables button and shows loading state during form submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Add a delay to the login function to test loading state
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    // Fill and submit form
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Check loading state
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/entrando/i);
    
    // Wait for completion and check button is re-enabled
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent(/entrar/i);
    });
  });
});