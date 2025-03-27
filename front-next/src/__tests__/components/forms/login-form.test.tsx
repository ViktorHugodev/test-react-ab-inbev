import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/features/authentication/login-form';
import { useAuth } from '@/hooks/use-auth';

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

const mockWindowLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

describe('LoginForm Component', () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowLocation.href = '';
    
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      user: null,
      logout: jest.fn(),
      canCreateRole: jest.fn(),
      registerEmployee: jest.fn()
    });
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  it('should render the login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
  
  it('should call login function with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  it('should redirect to default URL after successful login when no onSuccess prop is provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    mockLogin.mockResolvedValueOnce(undefined);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });
  
  it('should call onSuccess callback after successful login when provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    mockLogin.mockResolvedValueOnce(undefined);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Verifica que a redireção não aconteceu quando onSuccess é fornecido
    expect(window.location.href).not.toBe('/dashboard');
  });
  
  it('should redirect to custom URL when redirectUrl prop is provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm redirectUrl="/profile" />);
    
    mockLogin.mockResolvedValueOnce(undefined);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(window.location.href).toBe('/profile');
    });
  });
  
  it('should display loading state while login is in progress', () => {
    // Configura o mock com isLoading = true
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      user: null,
      logout: jest.fn(),
      canCreateRole: jest.fn(),
      registerEmployee: jest.fn()
    });
    
    render(<LoginForm />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Entrando...');
  });
  
  it('should update email and password state when user types in inputs', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    
    const passwordInput = screen.getByLabelText(/senha/i);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });
  
  it('should handle login failures and not redirect', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Login error'));
    
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verifica que não houve redirecionamento
    expect(window.location.href).toBe('');
    
    // Verifica que a mensagem de erro é exibida
    expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
  });
  
  it('should prevent form submission when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Tenta enviar o formulário sem preencher os campos
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verifica que a função de login não foi chamada
    expect(mockLogin).not.toHaveBeenCalled();
    
    // O atual componente usa validação de formulário, mas não exibe essa mensagem
    // específica, então vamos verificar apenas que o login não foi chamado
  });
});