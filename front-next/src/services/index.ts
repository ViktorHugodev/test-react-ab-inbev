// Entry point for all services
import { api, ApiError, getAuthToken } from "./api";
import { employeeService } from "./api/employee";
import { departmentService } from "./api/department";
import { authService } from "./api/auth";

// Export everything
export {
  api,
  ApiError,
  getAuthToken,
  employeeService,
  departmentService,
  authService,
};

// Also export from employee
export * from "./api/employee";
// Also export from department
export * from "./api/department";
// Also export from auth
export * from "./api/auth";