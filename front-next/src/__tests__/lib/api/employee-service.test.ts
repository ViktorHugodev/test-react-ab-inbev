import { employeeService } from '@/services/employee';
import { api } from '@/services/api';
import { EmployeeRole } from '@/types/employee';


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
      
      mockApi.get.mockResolvedValueOnce([mockEmployee]);

      
      const result = await employeeService.getAll();

      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees');
      
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });

    it('handles API errors when fetching all employees', async () => {
      
      const errorMessage = 'Network Error';
      mockApi.get.mockRejectedValueOnce(new Error(errorMessage));

      
      await expect(employeeService.getAll()).rejects.toThrow(errorMessage);
      
      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees');
    });
  });

  describe('getEmployees', () => {
    it('fetches employees with pagination params', async () => {
      
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      
      const pageNumber = 2;
      const pageSize = 15;
      
      const result = await employeeService.getEmployees({
        pageNumber,
        pageSize
      });

      
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      
      
      expect(result).toEqual(mockPagedResponse);
    });

    it('fetches employees with all filter params', async () => {
      
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      
      const pageNumber = 1;
      const pageSize = 10;
      const searchTerm = 'John';
      const department = 'TI';
      const managerId = '123'; 
      
      const result = await employeeService.getEmployees({
        pageNumber, 
        pageSize, 
        searchTerm, 
        department,
        managerId
      });

      
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}&department=${department}&managerId=${managerId}`
      );
      
      
      expect(result).toEqual(mockPagedResponse);
    });

    it('handles null filter params correctly', async () => {
      
      mockApi.get.mockResolvedValueOnce(mockPagedResponse);

      
      const pageNumber = 1;
      const pageSize = 10;
      const department = 'TI';
      
      const result = await employeeService.getEmployees({
        pageNumber, 
        pageSize,
        department
      });

      
      expect(mockApi.get).toHaveBeenCalledWith(
        `/Employees/paged?pageNumber=${pageNumber}&pageSize=${pageSize}&department=${department}`
      );
      
      
      expect(result).toEqual(mockPagedResponse);
    });

    it('handles API errors when fetching paged employees', async () => {
      
      const errorMessage = 'Bad Request';
      mockApi.get.mockRejectedValueOnce(new Error(errorMessage));

      
      await expect(employeeService.getEmployees({
        pageNumber: 1,
        pageSize: 10
      })).rejects.toThrow(errorMessage);
      
      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/paged?pageNumber=1&pageSize=10');
    });
  });

  describe('getEmployeeById', () => {
    it('fetches a single employee by ID', async () => {
      
      mockApi.get.mockResolvedValueOnce(mockEmployee);

      
      const result = await employeeService.getEmployeeById('123');

      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/123');
      
      
      expect(result).toEqual(mockEmployee);
    });

    it('throws error when employee ID is not found', async () => {
      
      mockApi.get.mockRejectedValueOnce(new Error('Employee not found'));

      
      await expect(employeeService.getEmployeeById('999')).rejects.toThrow('Employee not found');
      
      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/999');
    });
  });

  describe('createEmployee', () => {
    it('creates a new employee', async () => {
      
      mockApi.post.mockResolvedValueOnce(mockEmployee);

      
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

      
      const result = await employeeService.createEmployee(newEmployee);

      
      expect(mockApi.post).toHaveBeenCalledWith('/Employees', newEmployee);
      
      
      expect(result).toEqual(mockEmployee);
    });

    it('handles validation errors when creating employee', async () => {
      
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

      
      await expect(employeeService.createEmployee(invalidEmployee))
        .rejects.toEqual(validationError);
      
      
      expect(mockApi.post).toHaveBeenCalledWith('/Employees', invalidEmployee);
    });
  });

  describe('updateEmployee', () => {
    it('updates an existing employee', async () => {
      
      const updatedEmployee = {
        ...mockEmployee,
        firstName: 'Updated',
        lastName: 'Name'
      };
      mockApi.put.mockResolvedValueOnce(updatedEmployee);

      
      const updateData = {
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

      
      const result = await employeeService.updateEmployee('123', updateData);

      
      expect(mockApi.put).toHaveBeenCalledWith('/Employees/123', updateData);
      
      
      expect(result).toEqual(updatedEmployee);
    });

    it('handles errors when employee ID does not exist', async () => {
      
      mockApi.put.mockRejectedValueOnce(new Error('Employee not found'));

      
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'john.doe@example.com',
        documentNumber: '12345678900',
        birthDate: new Date('1990-01-01').toISOString(),
        role: EmployeeRole.Leader,
        department: 'TI',
        phoneNumbers: []
      };

      
      await expect(employeeService.updateEmployee('999', updateData))
        .rejects.toThrow('Employee not found');
      
      
      expect(mockApi.put).toHaveBeenCalledWith('/Employees/999', updateData);
    });
  });

  describe('deleteEmployee', () => {
    it('deletes an employee', async () => {
      
      mockApi.delete.mockResolvedValueOnce(true);

      
      await employeeService.deleteEmployee('123');

      
      expect(mockApi.delete).toHaveBeenCalledWith('/Employees/123');
    });

    it('handles errors when trying to delete non-existent employee', async () => {
      
      mockApi.delete.mockRejectedValueOnce(new Error('Employee not found'));

      
      await expect(employeeService.deleteEmployee('999'))
        .rejects.toThrow('Employee not found');
      
      
      expect(mockApi.delete).toHaveBeenCalledWith('/Employees/999');
    });
  });

  describe('getByDepartment', () => {
    it('fetches employees by department name', async () => {
      
      mockApi.get.mockResolvedValueOnce({ name: 'TI' });
      mockApi.get.mockResolvedValueOnce([mockEmployee]);

      
      const result = await employeeService.getByDepartment('TI');

      
      expect(mockApi.get).toHaveBeenCalledWith('/Departments/TI');
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/TI');
      
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEmployee);
    });

    it('returns empty array for department with no employees', async () => {
      
      mockApi.get.mockResolvedValueOnce({ name: 'Empty' });
      mockApi.get.mockResolvedValueOnce([]);

      
      const result = await employeeService.getByDepartment('Empty');

      
      expect(mockApi.get).toHaveBeenCalledWith('/Departments/Empty');
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/department/Empty');
      
      
      expect(result).toHaveLength(0);
    });

    it('returns empty array when department not found', async () => {
      
      mockApi.get.mockRejectedValueOnce(new Error('Department not found'));

      
      const result = await employeeService.getByDepartment('Invalid');
      
      
      expect(result).toEqual([]);
      expect(mockApi.get).toHaveBeenCalledWith('/Departments/Invalid');
    });
  });

  describe('validateDocument', () => {
    it('validates a document number correctly', async () => {
      
      mockApi.get.mockResolvedValueOnce({ isValid: true });
      mockApi.get.mockRejectedValueOnce(new Error('Invalid document'));
      
      
      expect(await employeeService.validateDocument('12345678909')).toBe(true);
      
      
      expect(await employeeService.validateDocument('ABCDEFGHIJK')).toBe(false);
      
      
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/validate-document/12345678909');
      expect(mockApi.get).toHaveBeenCalledWith('/Employees/validate-document/ABCDEFGHIJK');
    });
  });
});