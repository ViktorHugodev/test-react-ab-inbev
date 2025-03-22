import { render, screen, fireEvent } from '@testing-library/react';
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Mock functions
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  afterEach(() => {
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

    // Check if employee names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if emails are displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Check if departments are displayed
    expect(screen.getByText('TI')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();

    // Check if roles are displayed with correct badge
    expect(screen.getByText('Líder')).toBeInTheDocument();
    expect(screen.getByText('Diretor')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
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

    // Get all view buttons (there should be one for each employee)
    const viewButtons = screen.getAllByLabelText('Ver');
    
    // Click the first view button
    fireEvent.click(viewButtons[0]);
    
    // Check if onView was called with the correct employee ID
    expect(mockOnView).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
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

    // Get all edit buttons (there should be one for each employee)
    const editButtons = screen.getAllByLabelText('Editar');
    
    // Click the first edit button
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with the correct employee ID
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
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

    // Get all delete buttons (there should be one for each employee)
    const deleteButtons = screen.getAllByLabelText('Excluir');
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Check if onDelete was called with the correct employee ID
    expect(mockOnDelete).toHaveBeenCalledWith('1');
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
    const editButtons = screen.queryAllByLabelText('Editar');
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
    const deleteButtons = screen.queryAllByLabelText('Excluir');
    expect(deleteButtons.length).toBe(0);
  });
});
