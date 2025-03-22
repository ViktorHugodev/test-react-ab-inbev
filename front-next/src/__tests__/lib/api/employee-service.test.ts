import { employeeService } from '@/services/employee-service';
import { api } from '@/services/api';
import { EmployeeRole } from '@/types/employee';

// Mock the API service
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('Employee Service', () => {
  // Mock employee data
  const mockEmployee = {
    id: '123',
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
  };

  // Mock paged response
  const mockPagedResponse = {
    items: [mockEmployee],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all employees without filters', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce({ data: [mockEmployee] });

      // Call the service
      const result = await employeeService.getAll();

      // Verify API was called correctly
      expect(mockApi.get).toHaveBeenCalledWith('/Employees');
      
      // Verify response was adapted correctly
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });
  });

  describe('getPaged', () => {
    it('fetches employees with pagination and filters', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce({ data: mockPagedResponse });

      // Call the service with filters
      const pageNumber = 1;
      const pageSize = 10;
      const searchTerm = 'John';
      const department = 'TI';
      
      const result = await employeeService.getPaged(pageNumber, pageSize, searchTerm, department);

      // Verify API was called with correct query params
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/Employees/paged?')
      );
      
      // Verify response
      expect(result).toEqual(mockPagedResponse);
    });
  });

  describe('getById', () => {
    it('fetches a single employee by ID', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce({ data: mockEmployee });

      // Call the service
      const result = await employeeService.getById('123');

      // Verify API was called correctly
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/123');
      
      // Verify response
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('create', () => {
    it('creates a new employee', async () => {
      // Setup mock response
      mockApi.post.mockResolvedValueOnce({ data: mockEmployee });

      // New employee data
      const newEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        documentNumber: '12345678900',
        birthDate: new Date('1990-01-01').toISOString(),
        role: EmployeeRole.Leader,
        department: 'TI',
        phoneNumbers: [
          { number: '11999999999', type: 1 }
        ],
        password: 'Test@123' 
      };

      // Call the service
      const result = await employeeService.create(newEmployee);

      // Verify API was called correctly
      expect(mockApi.post).toHaveBeenCalledWith('/Employees', newEmployee);
      
      // Verify response
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('update', () => {
    it('updates an existing employee', async () => {
      // Setup mock response with updated data
      const updatedEmployee = {
        ...mockEmployee,
        firstName: 'Updated',
        lastName: 'Name'
      };
      mockApi.put.mockResolvedValueOnce({ data: updatedEmployee });

      // Update data
      const updateData = {
        id: '123',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'john.doe@example.com',
        documentNumber: '12345678900',
        birthDate: new Date('1990-01-01').toISOString(),
        role: EmployeeRole.Leader,
        department: 'TI',
        phoneNumbers: [
          { id: '1', number: '11999999999', type: 1 }
        ]
      };

      // Call the service
      const result = await employeeService.update(updateData);

      // Verify API was called correctly
      expect(mockApi.put).toHaveBeenCalledWith('/Employees/123', updateData);
      
      // Verify response
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('delete', () => {
    it('deletes an employee', async () => {
      // Setup mock response
      mockApi.delete.mockResolvedValueOnce({ data: true });

      // Call the service
      await employeeService.delete('123');

      // Verify API was called correctly
      expect(mockApi.delete).toHaveBeenCalledWith('/Employees/123');
    });
  });

  describe('getByDepartment', () => {
    it('fetches employees by department name', async () => {
      // Setup mock responses for employees
      mockApi.get.mockResolvedValueOnce({ data: [mockEmployee] });

      // Call the service
      const result = await employeeService.getByDepartment('TI');

      // Verify API calls
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/TI');
      
      // Verify response
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });
  });
});
