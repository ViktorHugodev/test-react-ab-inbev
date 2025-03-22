import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    render(<LoginForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
  
  it('validates email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Try to submit with empty fields
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    });
    
    // Fill invalid email
    await user.type(screen.getByLabelText(/e-mail/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });
  
  it('submits the form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
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
  
  it('handles login errors', async () => {
    // Mock login to throw error
    mockLogin.mockRejectedValueOnce(new Error('Email ou senha inválidos'));
    
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Fill data and submit
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Check if error was handled
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email ou senha inválidos');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
  
  it('disables the submit button during form submission', async () => {
    // Mock login to delay response
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const user = userEvent.setup();
    render(<LoginForm />);
    
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
});
