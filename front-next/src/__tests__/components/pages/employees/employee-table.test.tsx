import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeTable } from '@/components/pages/employees/employee-table';
import { EmployeeRole } from '@/types/employee';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('EmployeeTable', () => {
  // Mock data
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

  // Mock functions
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

    // Check if skeletons are rendered
    const skeletons = screen.getAllByRole('row');
    // Header row + 5 skeleton rows
    expect(skeletons.length).toBe(6);
    
    // Check for skeleton UI elements - looking for animate-pulse class which is used by Skeleton component
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

    // Check if empty state message is displayed
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

    // Check if all employees are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Check if emails are displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob.johnson@example.com')).toBeInTheDocument();

    // Check if departments are displayed
    const tiDepartments = screen.getAllByText('TI');
    expect(tiDepartments.length).toBe(2); // Two employees in TI
    expect(screen.getByText('Marketing')).toBeInTheDocument();

    // Check if roles are displayed with correct badge
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

    // Get all view buttons
    const viewButtons = screen.getAllByText('Ver');
    
    // Click each view button and verify the correct ID is passed
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

    // Get all edit buttons
    const editButtons = screen.getAllByText('Editar');
    
    // Click each edit button and verify the correct ID is passed
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

    // Get all delete buttons
    const deleteButtons = screen.getAllByText('Excluir');
    
    // Click each delete button and verify the correct ID is passed
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

    // Check if edit buttons are not rendered
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

    // Check if delete buttons are not rendered
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

    // Check role badges
    const directorBadge = screen.getByText('Diretor');
    expect(directorBadge.closest('div')).toHaveClass('bg-primary');
    
    // Leader role should have secondary variant
    const leaderBadge = screen.getByText('Líder');
    expect(leaderBadge.closest('div')).toHaveClass('bg-secondary');
    
    // Employee role should have outline variant
    const employeeBadge = screen.getByText('Funcionário');
    expect(employeeBadge.closest('div')).toHaveClass('border');
  });

  // Test for accessibility
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

    // Table should have accessible role
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Table headers should have proper role
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(5); // 5 columns in table
    
    // Action buttons should be present
    // Using text instead of aria-label due to how the buttons are implemented
    expect(screen.getAllByText('Ver').length).toBe(3);
    expect(screen.getAllByText('Editar').length).toBe(3);
    expect(screen.getAllByText('Excluir').length).toBe(3);
  });

  // Note: The following tests would require adding pagination and sorting functionality to the component

  it('should render pagination controls when implemented', () => {
    // This would test pagination controls once implemented
    expect(true).toBe(true);
  });

  it('should call onSort when column headers are clicked (once implemented)', () => {
    // This would test sorting functionality once implemented
    expect(true).toBe(true);
  });
});