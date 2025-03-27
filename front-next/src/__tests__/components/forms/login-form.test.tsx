import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/features/authentication/login-form';
import { useAuth } from '@/hooks/use-auth';

// Mock useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock window.location
const mockWindowLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

describe('LoginForm Component', () => {
  // Setup mocks
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.location.href
    mockWindowLocation.href = '';
    
    // Mock useAuth hook
    useAuth.mockReturnValue({
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
    
    // Check if the form elements are present
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
  
  it('should call login function with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify login function was called with correct data
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  it('should redirect to default URL after successful login when no onSuccess prop is provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });
  
  it('should call onSuccess callback after successful login when provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify onSuccess callback was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Verify redirect didn't happen
    expect(window.location.href).not.toBe('/dashboard');
  });
  
  it('should redirect to custom URL when redirectUrl prop is provided', async () => {
    const user = userEvent.setup();
    render(<LoginForm redirectUrl="/profile" />);
    
    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify redirect to custom URL
    await waitFor(() => {
      expect(window.location.href).toBe('/profile');
    });
  });
  
  it('should display loading state while login is in progress', () => {
    // Mock loading state
    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      user: null,
      logout: jest.fn(),
      canCreateRole: jest.fn(),
      registerEmployee: jest.fn()
    });
    
    render(<LoginForm />);
    
    // Verify button is in loading state
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Entrando...');
  });
  
  it('should update email and password state when user types in inputs', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Type in email field
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    
    // Type in password field
    const passwordInput = screen.getByLabelText(/senha/i);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });
  
  it('should work with Enter key for form submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    
    // Simulate Enter key press
    await user.keyboard('{Enter}');
    
    // Verify login function was called
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  it('should handle login failures and not redirect', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Login error'));
    
    render(<LoginForm />);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // No redirect should happen on error
    expect(window.location.href).toBe('');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  
  it('should prevent form submission when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Submit form without filling fields
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verify login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });
});