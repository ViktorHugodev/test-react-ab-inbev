import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { renderWithProviders } from '@/test/utils/test-utils';

// Mock dependencies
jest.mock('@/hooks/use-auth');
jest.mock('next/navigation');
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
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false
    });
    
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });
  
  it('renders the login form correctly', () => {
    renderWithProviders(<LoginForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/credenciais de exemplo/i)).toBeInTheDocument();
  });
  
  it('validates email field correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Try to submit with empty email
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show validation error for email
    await waitFor(() => {
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    });
    
    // Fill invalid email
    await user.type(screen.getByLabelText(/e-mail/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/e-mail válido/i)).toBeInTheDocument();
    });

    // Fill valid email but empty password
    await user.clear(screen.getByLabelText(/e-mail/i));
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show password validation error
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos/i)).toBeInTheDocument();
    });
  });

  it('validates password field correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill valid email but too short password
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), '12345');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show password validation error
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
  });
  
  it('submits the form with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill valid data
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Check if login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('handles login errors properly', async () => {
    // Mock login to throw error
    const errorMessage = 'Email ou senha inválidos';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill data and submit
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Check if error was handled and displayed correctly
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('handles generic errors without message property', async () => {
    // Mock login to throw a non-standard error
    mockLogin.mockRejectedValueOnce("Servidor indisponível");
    
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill data and submit
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Check if fallback error message is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email ou senha inválidos');
    });
  });
  
  it('disables the submit button and shows loading state during form submission', async () => {
    // Mock login to delay response
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill data and submit
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Button should be disabled and show loading state
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/entrando/i);
    
    // After login completes, button should be enabled again
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent(/entrar/i);
    });
  });

  it('maintains form state on multiple submission attempts', async () => {
    // First attempt fails, second succeeds
    mockLogin.mockRejectedValueOnce(new Error('Email ou senha inválidos'));
    mockLogin.mockResolvedValueOnce(undefined);
    
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    // Fill data and submit - first attempt
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Wait for error state to resolve
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Check that form fields maintain their values
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('test@example.com');
    
    // Correct the password and try again
    await user.clear(screen.getByLabelText(/senha/i));
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Second attempt should succeed
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // Testing accessibility
  it('has appropriate accessibility attributes', () => {
    renderWithProviders(<LoginForm />);
    
    // Labels are properly associated with inputs
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    
    expect(emailInput).toHaveAttribute('id');
    expect(passwordInput).toHaveAttribute('id');
    
    // Button should have appropriate text for screen readers
    expect(screen.getByRole('button')).toHaveAccessibleName('Entrar');
  });
});