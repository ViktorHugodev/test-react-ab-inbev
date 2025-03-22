import { render, screen } from '@testing-library/react';
import { EmployeeHeader } from '@/components/pages/employees/employee-header';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('EmployeeHeader', () => {
  it('renders title and subtitle correctly', () => {
    renderWithProviders(
      <EmployeeHeader 
        title="Funcionários" 
        subtitle="Gerencie os funcionários da empresa" 
      />
    );

    // Check if title is rendered
    expect(screen.getByText('Funcionários')).toBeInTheDocument();
    
    // Check if subtitle is rendered
    expect(screen.getByText('Gerencie os funcionários da empresa')).toBeInTheDocument();
  });

  it('renders with different title and subtitle', () => {
    renderWithProviders(
      <EmployeeHeader 
        title="Novo Funcionário" 
        subtitle="Adicione um novo funcionário ao sistema" 
      />
    );

    // Check if title is rendered
    expect(screen.getByText('Novo Funcionário')).toBeInTheDocument();
    
    // Check if subtitle is rendered
    expect(screen.getByText('Adicione um novo funcionário ao sistema')).toBeInTheDocument();
  });

  it('applies the correct styling classes', () => {
    const { container } = renderWithProviders(
      <EmployeeHeader 
        title="Funcionários" 
        subtitle="Gerencie os funcionários da empresa" 
      />
    );

    // Check if the header has the correct background gradient class
    const headerDiv = container.firstChild;
    expect(headerDiv).toHaveClass('bg-gradient-to-r');
    expect(headerDiv).toHaveClass('from-primary/10');
    
    // Check if the title has the correct styling
    const titleElement = screen.getByText('Funcionários');
    expect(titleElement).toHaveClass('text-3xl');
    expect(titleElement).toHaveClass('font-bold');
    
    // Check if the subtitle has the correct styling
    const subtitleElement = screen.getByText('Gerencie os funcionários da empresa');
    expect(subtitleElement).toHaveClass('text-muted-foreground');
  });
});
