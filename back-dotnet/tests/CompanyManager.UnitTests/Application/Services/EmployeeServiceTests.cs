using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.Interfaces.Repositories;
using CompanyManager.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;

namespace CompanyManager.UnitTests.Application.Services
{
    public class EmployeeServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IEmployeeRepository> _mockEmployeeRepository;
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<EmployeeService>> _mockLogger;
        private readonly EmployeeService _employeeService;

        public EmployeeServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockEmployeeRepository = new Mock<IEmployeeRepository>();
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<EmployeeService>>();
            
            // Setup UnitOfWork to return the mock repository
            _mockUnitOfWork.Setup(uow => uow.Employees).Returns(_mockEmployeeRepository.Object);
            
            // Create instance of the service to test
            _employeeService = new EmployeeService(
                _mockUnitOfWork.Object,
                _mockAuthService.Object,
                _mockLogger.Object
            );
        }
        
        [Fact]
        public async Task GetByIdAsync_WithValidId_ReturnsEmployeeDto()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var employee = CreateTestEmployee();
            
            // Use reflection to set the Id
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            
            // Act
            var result = await _employeeService.GetByIdAsync(employeeId);
            
            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(employeeId);
            result.FirstName.Should().Be(employee.FirstName);
            result.LastName.Should().Be(employee.LastName);
            result.Email.Should().Be(employee.Email);
        }
        
        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ThrowsEntityNotFoundException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employee)null);
            
            // Act & Assert
            await Assert.ThrowsAsync<EntityNotFoundException>(() => 
                _employeeService.GetByIdAsync(employeeId));
        }
        
        [Fact]
        public async Task GetAllAsync_ReturnsAllEmployees()
        {
            // Arrange
            var employees = new List<Employee>
            {
                CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee),
                CreateTestEmployee("Jane", "Smith", "jane@example.com", Role.Leader),
                CreateTestEmployee("Admin", "User", "admin@example.com", Role.Director)
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);
            
            // Act
            var result = await _employeeService.GetAllAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(employees.Count);
            result.Select(e => e.Email).Should().Contain(employees.Select(e => e.Email));
        }
        
        [Fact]
        public async Task GetPagedAsync_ReturnsCorrectPagedResults()
        {
            // Arrange
            var employees = new List<Employee>
            {
                CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee),
                CreateTestEmployee("Jane", "Smith", "jane@example.com", Role.Leader)
            };
            
            int totalCount = 10; // Total in database
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetPagedAsync(
                    It.IsAny<int>(), 
                    It.IsAny<int>(), 
                    It.IsAny<string>(), 
                    It.IsAny<string>(), 
                    It.IsAny<Guid?>(), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((employees, totalCount));
            
            // Act
            var result = await _employeeService.GetPagedAsync(1, 5);
            
            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(2);
            result.TotalCount.Should().Be(totalCount);
            result.PageNumber.Should().Be(1);
            result.PageSize.Should().Be(5);
            result.TotalPages.Should().Be(2); // 10 items with page size 5 = 2 pages
        }
        
        [Fact]
        public async Task GetByDepartmentAsync_ReturnsFilteredEmployees()
        {
            // Arrange
            string department = "IT";
            var employees = new List<Employee>
            {
                CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee, department),
                CreateTestEmployee("Jane", "Smith", "jane@example.com", Role.Leader, department)
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByDepartmentAsync(department, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);
            
            // Act
            var result = await _employeeService.GetByDepartmentAsync(department);
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(employees.Count);
            result.All(e => e.Department == department).Should().BeTrue();
        }
        
        [Fact]
        public async Task GetByManagerIdAsync_ReturnsSubordinates()
        {
            // Arrange
            var managerId = Guid.NewGuid();
            var employees = new List<Employee>
            {
                CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee, "IT", managerId),
                CreateTestEmployee("Jane", "Smith", "jane@example.com", Role.Employee, "HR", managerId)
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByManagerIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);
            
            // Act
            var result = await _employeeService.GetByManagerIdAsync(managerId);
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(employees.Count);
        }
        
        [Fact]
        public async Task GetLeadersAndDirectorsAsync_ReturnsOnlyLeadersAndDirectors()
        {
            // Arrange
            var leaders = new List<Employee>
            {
                CreateTestEmployee("John", "Leader", "leader@example.com", Role.Leader),
                CreateTestEmployee("Jane", "Director", "director@example.com", Role.Director)
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByRolesAsync(
                    It.Is<IEnumerable<Role>>(roles => 
                        roles.Contains(Role.Leader) && roles.Contains(Role.Director)), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(leaders);
            
            // Act
            var result = await _employeeService.GetLeadersAndDirectorsAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(leaders.Count);
            result.All(e => e.Role == Role.Leader || e.Role == Role.Director).Should().BeTrue();
        }
        
        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsEmployeeDto()
        {
            // Arrange
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "password123",
                Role = Role.Employee,
                Department = "IT"
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByDocumentNumberAsync(createDto.DocumentNumber, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockAuthService.Setup(auth => 
                auth.HashPassword(createDto.Password))
                .Returns("hashed_password");
                
            _mockEmployeeRepository.Setup(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _employeeService.CreateAsync(createDto);
            
            // Assert
            result.Should().NotBeNull();
            result.FirstName.Should().Be(createDto.FirstName);
            result.LastName.Should().Be(createDto.LastName);
            result.Email.Should().Be(createDto.Email);
            result.Role.Should().Be(createDto.Role);
            result.Department.Should().Be(createDto.Department);
            
            _mockEmployeeRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task CreateAsync_WithExistingEmail_ThrowsDuplicateEntityException()
        {
            // Arrange
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "existing@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "password123",
                Role = Role.Employee,
                Department = "IT"
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act & Assert
            await Assert.ThrowsAsync<DuplicateEntityException>(() => 
                _employeeService.CreateAsync(createDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task CreateAsync_WithExistingDocumentNumber_ThrowsDuplicateEntityException()
        {
            // Arrange
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                DocumentNumber = "existing-document",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "password123",
                Role = Role.Employee,
                Department = "IT"
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByDocumentNumberAsync(createDto.DocumentNumber, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act & Assert
            await Assert.ThrowsAsync<DuplicateEntityException>(() => 
                _employeeService.CreateAsync(createDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task CreateAsync_WithInvalidManager_ThrowsEntityNotFoundException()
        {
            // Arrange
            var managerId = Guid.NewGuid();
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "password123",
                Role = Role.Employee,
                Department = "IT",
                ManagerId = managerId
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByDocumentNumberAsync(createDto.DocumentNumber, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employee)null);
            
            // Act & Assert
            await Assert.ThrowsAsync<EntityNotFoundException>(() => 
                _employeeService.CreateAsync(createDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task CreateAsync_WithInvalidHierarchy_ThrowsInsufficientPermissionException()
        {
            // Arrange
            var managerId = Guid.NewGuid();
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "password123",
                Role = Role.Director, // Employee trying to manage Director
                Department = "IT",
                ManagerId = managerId
            };
            
            var manager = CreateTestEmployee("Manager", "Name", "manager@example.com", Role.Employee);
            typeof(Employee).GetProperty("Id").SetValue(manager, managerId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByDocumentNumberAsync(createDto.DocumentNumber, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);
            
            // Act & Assert
            await Assert.ThrowsAsync<InsufficientPermissionException>(() => 
                _employeeService.CreateAsync(createDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task UpdateAsync_WithValidData_ReturnsUpdatedEmployeeDto()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe Updated",
                Email = "john@example.com",
                BirthDate = new DateTime(1990, 1, 1),
                Role = Role.Employee,
                Department = "HR" // Changed department
            };
            
            var existingEmployee = CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee, "IT");
            typeof(Employee).GetProperty("Id").SetValue(existingEmployee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEmployee);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _employeeService.UpdateAsync(updateDto);
            
            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(employeeId);
            result.FirstName.Should().Be(updateDto.FirstName);
            result.LastName.Should().Be(updateDto.LastName);
            result.Department.Should().Be(updateDto.Department);
            
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task UpdateAsync_WithDuplicateEmail_ThrowsDuplicateEntityException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                Email = "new@example.com", // Changed email
                BirthDate = new DateTime(1990, 1, 1),
                Role = Role.Employee,
                Department = "IT"
            };
            
            var existingEmployee = CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee);
            typeof(Employee).GetProperty("Id").SetValue(existingEmployee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEmployee);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(updateDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act & Assert
            await Assert.ThrowsAsync<DuplicateEntityException>(() => 
                _employeeService.UpdateAsync(updateDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task UpdateAsync_WithSelfManagement_ThrowsDomainException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                BirthDate = new DateTime(1990, 1, 1),
                Role = Role.Employee,
                Department = "IT",
                ManagerId = employeeId // Self-reference
            };
            
            var existingEmployee = CreateTestEmployee("John", "Doe", "john@example.com", Role.Employee);
            typeof(Employee).GetProperty("Id").SetValue(existingEmployee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEmployee);
            
            // Act & Assert
            await Assert.ThrowsAsync<DomainException>(() => 
                _employeeService.UpdateAsync(updateDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task UpdatePasswordAsync_WithValidCredentials_ReturnsTrue()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = employeeId,
                CurrentPassword = "currentPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };
            
            var employee = CreateTestEmployee();
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
                
            _mockAuthService.Setup(auth => 
                auth.VerifyPasswordAsync(employee.Email, updateDto.CurrentPassword, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
                
            _mockAuthService.Setup(auth => 
                auth.HashPassword(updateDto.NewPassword))
                .Returns("new_hashed_password");
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _employeeService.UpdatePasswordAsync(updateDto);
            
            // Assert
            result.Should().BeTrue();
            
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task UpdatePasswordAsync_WithInvalidCurrentPassword_ThrowsInvalidCredentialsException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = employeeId,
                CurrentPassword = "wrongPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };
            
            var employee = CreateTestEmployee();
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
                
            _mockAuthService.Setup(auth => 
                auth.VerifyPasswordAsync(employee.Email, updateDto.CurrentPassword, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidCredentialsException>(() => 
                _employeeService.UpdatePasswordAsync(updateDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task UpdatePasswordAsync_WithMismatchedNewPasswords_ThrowsValidationException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = employeeId,
                CurrentPassword = "currentPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "differentPassword" // Mismatch
            };
            
            var employee = CreateTestEmployee();
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
                
            _mockAuthService.Setup(auth => 
                auth.VerifyPasswordAsync(employee.Email, updateDto.CurrentPassword, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => 
                _employeeService.UpdatePasswordAsync(updateDto));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task DeleteAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var employee = CreateTestEmployee();
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByManagerIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Employee>());
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _employeeService.DeleteAsync(employeeId);
            
            // Assert
            result.Should().BeTrue();
            
            _mockEmployeeRepository.Verify(repo => 
                repo.DeleteAsync(employee, It.IsAny<CancellationToken>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task DeleteAsync_WithSubordinates_ThrowsDomainException()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var employee = CreateTestEmployee("Manager", "Name", "manager@example.com", Role.Leader);
            typeof(Employee).GetProperty("Id").SetValue(employee, employeeId);
            
            var subordinates = new List<Employee>
            {
                CreateTestEmployee("Sub1", "Name", "sub1@example.com", Role.Employee, "IT", employeeId),
                CreateTestEmployee("Sub2", "Name", "sub2@example.com", Role.Employee, "IT", employeeId)
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
                
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByManagerIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(subordinates);
            
            // Act & Assert
            await Assert.ThrowsAsync<DomainException>(() => 
                _employeeService.DeleteAsync(employeeId));
                
            _mockEmployeeRepository.Verify(repo => 
                repo.DeleteAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task ExistsByEmailAsync_ReturnsTrueForExistingEmail()
        {
            // Arrange
            string email = "exists@example.com";
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByEmailAsync(email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act
            var result = await _employeeService.ExistsByEmailAsync(email);
            
            // Assert
            result.Should().BeTrue();
        }
        
        [Fact]
        public async Task ExistsByDocumentNumberAsync_ReturnsTrueForExistingDocument()
        {
            // Arrange
            string documentNumber = "12345678900";
            
            _mockEmployeeRepository.Setup(repo => 
                repo.ExistsByDocumentNumberAsync(documentNumber, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act
            var result = await _employeeService.ExistsByDocumentNumberAsync(documentNumber);
            
            // Assert
            result.Should().BeTrue();
        }
        
        // Helper method to create test employees
        private Employee CreateTestEmployee(
            string firstName = "Test", 
            string lastName = "User", 
            string email = "test@example.com", 
            Role role = Role.Employee,
            string department = "IT",
            Guid? managerId = null)
        {
            var employee = new Employee(
                firstName,
                lastName,
                email,
                "12345678900",
                new DateTime(1990, 1, 1),
                role,
                department,
                managerId
            );
            
            employee.SetPasswordHash("hashed_password");
            return employee;
        }
    }
}