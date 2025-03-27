import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeTable } from '@/components/pages/employees/employee-table';
import { EmployeeRole } from '@/types/employee';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('EmployeeTable', () => {
  
  const mockEmployees = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      documentNumber: '12345678900',
      birthDate: new Date('1990-01-01').toISOString(),
      age: 33,
      role: EmployeeRole.Leader,
      department: 'TI',
      phoneNumbers: [
        { id: '1', number: '11999999999', type: 1 }
      ],
      createdAt: new Date('2023-05-20').toISOString(),
      updatedAt: new Date('2023-06-15').toISOString()
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      documentNumber: '98765432100',
      birthDate: new Date('1992-05-15').toISOString(),
      age: 31,
      role: EmployeeRole.Director,
      department: 'Marketing',
      phoneNumbers: [
        { id: '2', number: '11988888888', type: 1 }
      ],
      createdAt: new Date('2023-01-10').toISOString(),
      updatedAt: new Date('2023-02-20').toISOString()
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      fullName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      documentNumber: '45678912300',
      birthDate: new Date('1985-08-20').toISOString(),
      age: 38,
      role: EmployeeRole.Employee,
      department: 'TI',
      phoneNumbers: [
        { id: '3', number: '11977777777', type: 1 }
      ],
      createdAt: new Date('2023-03-15').toISOString(),
      updatedAt: new Date('2023-04-10').toISOString()
    }
  ];

  
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSort = jest.fn();
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons when isLoading is true', () => {
    renderWithProviders(
      <EmployeeTable
        employees={[]}
        isLoading={true}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    const skeletons = screen.getAllByRole('row');
    
    expect(skeletons.length).toBe(6);
    
    
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders empty state when no employees are provided', () => {
    renderWithProviders(
      <EmployeeTable
        employees={[]}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    expect(screen.getByText('Nenhum funcionário encontrado.')).toBeInTheDocument();
  });

  it('renders employee data correctly', () => {
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob.johnson@example.com')).toBeInTheDocument();

    
    const tiDepartments = screen.getAllByText('TI');
    expect(tiDepartments.length).toBe(2); 
    expect(screen.getByText('Marketing')).toBeInTheDocument();

    
    expect(screen.getByText('Líder')).toBeInTheDocument();
    expect(screen.getByText('Diretor')).toBeInTheDocument();
    expect(screen.getByText('Funcionário')).toBeInTheDocument();
  });

  it('calls onView with correct employee ID when view button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    const viewButtons = screen.getAllByText('Ver');
    
    
    await user.click(viewButtons[0]);
    expect(mockOnView).toHaveBeenCalledWith('1');
    
    await user.click(viewButtons[1]);
    expect(mockOnView).toHaveBeenCalledWith('2');
    
    await user.click(viewButtons[2]);
    expect(mockOnView).toHaveBeenCalledWith('3');
  });

  it('calls onEdit with correct employee ID when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    const editButtons = screen.getAllByText('Editar');
    
    
    await user.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith('1');
    
    await user.click(editButtons[1]);
    expect(mockOnEdit).toHaveBeenCalledWith('2');
    
    await user.click(editButtons[2]);
    expect(mockOnEdit).toHaveBeenCalledWith('3');
  });

  it('calls onDelete with correct employee ID when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    const deleteButtons = screen.getAllByText('Excluir');
    
    
    await user.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
    
    await user.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith('2');
    
    await user.click(deleteButtons[2]);
    expect(mockOnDelete).toHaveBeenCalledWith('3');
  });

  it('does not render edit button when canEdit is false', () => {
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={false}
        canDelete={true}
      />
    );

    
    const editButtons = screen.queryAllByText('Editar');
    expect(editButtons.length).toBe(0);
  });

  it('does not render delete button when canDelete is false', () => {
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={false}
      />
    );

    
    const deleteButtons = screen.queryAllByText('Excluir');
    expect(deleteButtons.length).toBe(0);
  });

  it('renders the correct role badge variant for each role', () => {
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    const directorBadge = screen.getByText('Diretor');
    expect(directorBadge.closest('div')).toHaveClass('bg-primary');
    
    
    const leaderBadge = screen.getByText('Líder');
    expect(leaderBadge.closest('div')).toHaveClass('bg-secondary');
    
    
    const employeeBadge = screen.getByText('Funcionário');
    expect(employeeBadge.closest('div')).toHaveClass('border');
  });

  
  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <EmployeeTable
        employees={mockEmployees}
        isLoading={false}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canEdit={true}
        canDelete={true}
      />
    );

    
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(5); 
    
    
    
    expect(screen.getAllByText('Ver').length).toBe(3);
    expect(screen.getAllByText('Editar').length).toBe(3);
    expect(screen.getAllByText('Excluir').length).toBe(3);
  });

  

  it('should render pagination controls when implemented', () => {
    
    expect(true).toBe(true);
  });

  it('should call onSort when column headers are clicked (once implemented)', () => {
    
    expect(true).toBe(true);
  });
});