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
      mockApi.get.mockResolvedValueOnce([mockEmployee]);

      // Call the service
      const result = await employeeService.getAll();

      // Verify API was called correctly
      expect(mockApi.get).toHaveBeenCalledWith('/Employees');
      
      // Verify response was adapted correctly
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });

    it('handles API errors when fetching all employees', async () => {
      // Setup mock error response
      const errorMessage = 'Network Error';
      mockApi.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call the service and expect it to throw
      await expect(employeeService.getAll()).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(mockApi.get).toHaveBeenCalledWith('/Employees');
    });
  });

  describe('getPaged', () => {
    it('fetches employees with pagination params', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      // Call the service with pagination only
      const pageNumber = 2;
      const pageSize = 15;
      
      const result = await employeeService.getPaged(pageNumber, pageSize);

      // Verify API was called with correct query params
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      
      // Verify response
      expect(result).toEqual(mockPagedResponse);
    });

    it('fetches employees with all filter params', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      // Call the service with all filters
      const pageNumber = 1;
      const pageSize = 10;
      const searchTerm = 'John';
      const department = 'TI';
      const managerId = '123'; // Updated to use managerId instead of role
      
      const result = await employeeService.getPaged(
        pageNumber, 
        pageSize, 
        searchTerm, 
        department,
        managerId
      );

      // Verify API was called with correct query params
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}&department=${department}&managerId=${managerId}`
      );
      
      // Verify response
      expect(result).toEqual(mockPagedResponse);
    });

    it('handles null filter params correctly', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      // Call the service with some null filters
      const pageNumber = 1;
      const pageSize = 10;
      const searchTerm = null;
      const department = 'TI';
      
      const result = await employeeService.getPaged(
        pageNumber, 
        pageSize, 
        searchTerm, 
        department
      );

      // Verify API was called with correct query params (searchTerm should be omitted)
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}&department=${department}`
      );
      
      // Verify response
      expect(result).toEqual(mockPagedResponse);
    });

    it('handles API errors when fetching paged employees', async () => {
      // Setup mock error response
      const errorMessage = 'Bad Request';
      mockApi.get.mockRejectedValueOnce(new Error(errorMessage));

      // Call the service and expect it to throw
      await expect(employeeService.getPaged(1, 10)).rejects.toThrow(errorMessage);
      
      // Verify API was called
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/paged?pageNumber=1&pageSize=10');
    });
  });

  describe('getById', () => {
    it('fetches a single employee by ID', async () => {
      // Setup mock response
      mockApi.get.mockResolvedValueOnce(mockEmployee);

      // Call the service
      const result = await employeeService.getById('123');

      // Verify API was called correctly
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/123');
      
      // Verify response
      expect(result).toEqual(mockEmployee);
    });

    it('throws error when employee ID is not found', async () => {
      // Setup mock error response
      mockApi.get.mockRejectedValueOnce(new Error('Employee not found'));

      // Call the service and expect it to throw
      await expect(employeeService.getById('999')).rejects.toThrow('Employee not found');
      
      // Verify API was called
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/999');
    });
  });

  describe('create', () => {
    it('creates a new employee', async () => {
      // Setup mock response
      mockApi.post.mockResolvedValueOnce(mockEmployee);

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

    it('handles validation errors when creating employee', async () => {
      // Setup mock error response with validation details
      const validationError = {
        response: {
          data: {
            errors: {
              Email: ['Email is invalid'],
              DocumentNumber: ['Document number is required']
            }
          },
          status: 400
        }
      };
      mockApi.post.mockRejectedValueOnce(validationError);

      // Invalid employee data
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        documentNumber: '',
        birthDate: new Date('1990-01-01').toISOString(),
        role: EmployeeRole.Leader,
        department: 'TI',
        phoneNumbers: [],
        password: 'Test@123' 
      };

      // Call the service and expect it to throw
      await expect(employeeService.create(invalidEmployee))
        .rejects.toEqual(validationError);
      
      // Verify API was called
      expect(mockApi.post).toHaveBeenCalledWith('/Employees', invalidEmployee);
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
      mockApi.put.mockResolvedValueOnce(updatedEmployee);

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

    it('handles errors when employee ID does not exist', async () => {
      // Setup mock error response
      mockApi.put.mockRejectedValueOnce(new Error('Employee not found'));

      // Update data with non-existent ID
      const updateData = {
        id: '999',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'john.doe@example.com',
        documentNumber: '12345678900',
        birthDate: new Date('1990-01-01').toISOString(),
        role: EmployeeRole.Leader,
        department: 'TI',
        phoneNumbers: []
      };

      // Call the service and expect it to throw
      await expect(employeeService.update(updateData))
        .rejects.toThrow('Employee not found');
      
      // Verify API was called
      expect(mockApi.put).toHaveBeenCalledWith('/Employees/999', updateData);
    });
  });

  describe('delete', () => {
    it('deletes an employee', async () => {
      // Setup mock response
      mockApi.delete.mockResolvedValueOnce(true);

      // Call the service
      await employeeService.delete('123');

      // Verify API was called correctly
      expect(mockApi.delete).toHaveBeenCalledWith('/Employees/123');
    });

    it('handles errors when trying to delete non-existent employee', async () => {
      // Setup mock error response
      mockApi.delete.mockRejectedValueOnce(new Error('Employee not found'));

      // Call the service and expect it to throw
      await expect(employeeService.delete('999'))
        .rejects.toThrow('Employee not found');
      
      // Verify API was called
      expect(mockApi.delete).toHaveBeenCalledWith('/Employees/999');
    });
  });

  describe('getByDepartment', () => {
    it('fetches employees by department name', async () => {
      // Setup mock responses for employees
      mockApi.get.mockResolvedValueOnce([mockEmployee]);

      // Call the service
      const result = await employeeService.getByDepartment('TI');

      // Verify API calls
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/TI');
      
      // Verify response
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });

    it('returns empty array for department with no employees', async () => {
      // Setup mock response with empty array
      mockApi.get.mockResolvedValueOnce([]);

      // Call the service
      const result = await employeeService.getByDepartment('Empty');

      // Verify API calls
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/Empty');
      
      // Verify empty result
      expect(result).toHaveLength(0);
    });

    it('handles API errors when fetching by department', async () => {
      // Setup mock error response
      mockApi.get.mockRejectedValueOnce(new Error('Department not found'));

      // Call the service and expect it to throw
      await expect(employeeService.getByDepartment('Invalid'))
        .rejects.toThrow('Department not found');
      
      // Verify API was called
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/Invalid');
    });
  });

  describe('validateDocumentNumber', () => {
    it('validates a document number correctly', () => {
      // Valid CPF
      expect(employeeService.validateDocumentNumber('12345678909')).toBe(true);
      
      // Invalid formats
      expect(employeeService.validateDocumentNumber('123.456.789-09')).toBe(false);
      expect(employeeService.validateDocumentNumber('12345')).toBe(false);
      expect(employeeService.validateDocumentNumber('ABCDEFGHIJK')).toBe(false);
    });
  });
});