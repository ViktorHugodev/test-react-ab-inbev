import { render, screen } from '@testing-library/react';
import { EmployeeHeader } from '@/components/pages/employees/employee-header';

describe('EmployeeHeader', () => {
  it('renders title and subtitle correctly', () => {
    render(
      <EmployeeHeader 
        title="Funcionários" 
        subtitle="Gerencie os funcionários da empresa" 
      />
    );

    
    expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
    
    
    expect(screen.getByText('Gerencie os funcionários da empresa')).toBeInTheDocument();
  });

  it('renders with different title and subtitle', () => {
    render(
      <EmployeeHeader 
        title="Novo Funcionário" 
        subtitle="Adicione um novo funcionário ao sistema" 
      />
    );

    
    expect(screen.getByRole('heading', { name: 'Novo Funcionário' })).toBeInTheDocument();
    
    
    expect(screen.getByText('Adicione um novo funcionário ao sistema')).toBeInTheDocument();
  });

  it('renders correctly with empty subtitle', () => {
    
    render(
      <EmployeeHeader 
        title="Funcionários"
        subtitle=""
      />
    );

    
    expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
    
    
    const subtitleElement = screen.getByTestId('empty-subtitle');
    expect(subtitleElement).toBeInTheDocument();
    expect(subtitleElement).toHaveClass('text-muted-foreground');
  });

  it('has appropriate semantic HTML structure', () => {
    render(
      <EmployeeHeader 
        title="Funcionários" 
        subtitle="Gerencie os funcionários da empresa" 
      />
    );

    
    const headerElement = screen.getByRole('heading', { name: 'Funcionários' }).closest('div');
    expect(headerElement).toBeInTheDocument();
    
    
    const titleElement = screen.getByRole('heading', { name: 'Funcionários' });
    expect(titleElement.tagName).toBe('H1');
    
    
    const subtitleElement = screen.getByText('Gerencie os funcionários da empresa');
    expect(subtitleElement).toHaveAttribute('class', expect.stringContaining('text-muted-foreground'));
  });

  it('has the correct gradient background classes', () => {
    const { container } = render(
      <EmployeeHeader 
        title="Funcionários" 
        subtitle="Gerencie os funcionários da empresa" 
      />
    );

    
    const headerElement = container.firstChild;
    expect(headerElement).toHaveClass('bg-gradient-to-r');
    expect(headerElement).toHaveClass('from-primary/10');
  });
});