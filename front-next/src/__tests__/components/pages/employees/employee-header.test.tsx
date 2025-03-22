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

    // Check if title is rendered
    expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
    
    // Check if subtitle is rendered
    expect(screen.getByText('Gerencie os funcionários da empresa')).toBeInTheDocument();
  });

  it('renders with different title and subtitle', () => {
    render(
      <EmployeeHeader 
        title="Novo Funcionário" 
        subtitle="Adicione um novo funcionário ao sistema" 
      />
    );

    // Check if title is rendered
    expect(screen.getByRole('heading', { name: 'Novo Funcionário' })).toBeInTheDocument();
    
    // Check if subtitle is rendered
    expect(screen.getByText('Adicione um novo funcionário ao sistema')).toBeInTheDocument();
  });

  it('renders correctly with empty subtitle', () => {
    // NOTE: The component requires subtitle, so we're passing an empty string
    render(
      <EmployeeHeader 
        title="Funcionários"
        subtitle=""
      />
    );

    // Check if title is rendered
    expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
    
    // Check for paragraph with empty text
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

    // Header should be contained in a header element or div with appropriate role
    const headerElement = screen.getByRole('heading', { name: 'Funcionários' }).closest('div');
    expect(headerElement).toBeInTheDocument();
    
    // Title should be in a heading element
    const titleElement = screen.getByRole('heading', { name: 'Funcionários' });
    expect(titleElement.tagName).toBe('H1');
    
    // Subtitle should have descriptive text
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

    // Check if the header has the correct classes
    const headerElement = container.firstChild;
    expect(headerElement).toHaveClass('bg-gradient-to-r');
    expect(headerElement).toHaveClass('from-primary/10');
  });
});