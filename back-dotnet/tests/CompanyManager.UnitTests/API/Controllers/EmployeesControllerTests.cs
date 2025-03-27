using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.API.Controllers;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.ValueObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;

namespace CompanyManager.UnitTests.API.Controllers
{
    public class EmployeesControllerTests
    {
        private readonly Mock<IEmployeeService> _mockEmployeeService;
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<EmployeesController>> _mockLogger;
        private readonly EmployeesController _controller;

        public EmployeesControllerTests()
        {
            _mockEmployeeService = new Mock<IEmployeeService>();
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<EmployeesController>>();
            _controller = new EmployeesController(
                _mockEmployeeService.Object, 
                _mockAuthService.Object, 
                _mockLogger.Object);
            
            // Setup controller context with Director role for most tests
            SetupUserWithRole(Role.Director);
        }

        [Fact]
        public async Task GetAll_ReturnsOkWithEmployees()
        {
            // Arrange
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = "IT", Role = Role.Employee },
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "Jane Smith", Email = "jane@example.com", Department = "HR", Role = Role.Leader }
            };

            _mockEmployeeService.Setup(service =>
                service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);

            // Act
            var result = await _controller.GetAll(CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(employees);
        }

        [Fact]
        public async Task GetPaged_WithDefaultParameters_ReturnsOkWithPagedResult()
        {
            // Arrange
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = "IT", Role = Role.Employee },
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "Jane Smith", Email = "jane@example.com", Department = "HR", Role = Role.Leader }
            };

            var pagedResult = new PagedResultDto<EmployeeListItemDto>
            {
                Items = employees,
                TotalCount = 2,
                PageNumber = 1,
                PageSize = 10
            };

            _mockEmployeeService.Setup(service =>
                service.GetPagedAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<Guid?>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(pagedResult);

            // Act
            var result = await _controller.GetPaged(pageNumber: 1, pageSize: 10, cancellationToken: CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(pagedResult);
        }

        [Fact]
        public async Task GetPaged_WithSearchParameters_ReturnsOkWithFilteredResult()
        {
            // Arrange
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = "IT", Role = Role.Employee }
            };

            var pagedResult = new PagedResultDto<EmployeeListItemDto>
            {
                Items = employees,
                TotalCount = 1,
                PageNumber = 1,
                PageSize = 10
            };

            _mockEmployeeService.Setup(service =>
                service.GetPagedAsync(
                    1,
                    10,
                    "John",
                    "IT",
                    null,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(pagedResult);

            // Act
            var result = await _controller.GetPaged(
                pageNumber: 1, 
                pageSize: 10, 
                searchTerm: "John", 
                department: "IT", 
                cancellationToken: CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(pagedResult);
        }

        [Fact]
        public async Task GetById_WithValidId_ReturnsOkWithEmployee()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var employee = new EmployeeDto 
            { 
                Id = employeeId, 
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                Email = "john@example.com",
                Department = "IT",
                Role = Role.Employee 
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // Act
            var result = await _controller.GetById(employeeId, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<EmployeeDto>().Subject;
            returnValue.Should().BeEquivalentTo(employee);
        }

        [Fact]
        public async Task GetById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var employeeId = Guid.NewGuid();

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new EntityNotFoundException("Funcionário", employeeId.ToString()));

            // Act
            var result = await _controller.GetById(employeeId, CancellationToken.None);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(employeeId.ToString());
        }

        [Fact]
        public async Task GetByDepartment_ReturnsOkWithEmployees()
        {
            // Arrange
            var department = "IT";
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = department, Role = Role.Employee },
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "Jane Smith", Email = "jane@example.com", Department = department, Role = Role.Leader }
            };

            _mockEmployeeService.Setup(service =>
                service.GetByDepartmentAsync(department, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);

            // Act
            var result = await _controller.GetByDepartment(department, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(employees);
        }

        [Fact]
        public async Task GetByManager_ReturnsOkWithEmployees()
        {
            // Arrange
            var managerId = Guid.NewGuid();
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = "IT", Role = Role.Employee },
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "Jane Smith", Email = "jane@example.com", Department = "HR", Role = Role.Employee }
            };

            _mockEmployeeService.Setup(service =>
                service.GetByManagerIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);

            // Act
            var result = await _controller.GetByManager(managerId, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(employees);
        }
        
        [Fact]
        public async Task GetLeadersAndDirectors_ReturnsOkWithLeadersAndDirectors()
        {
            // Arrange
            var employees = new List<EmployeeListItemDto>
            {
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "John Doe", Email = "john@example.com", Department = "IT", Role = Role.Leader },
                new EmployeeListItemDto { Id = Guid.NewGuid(), FullName = "Jane Smith", Email = "jane@example.com", Department = "HR", Role = Role.Director }
            };

            _mockEmployeeService.Setup(service =>
                service.GetLeadersAndDirectorsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);

            // Act
            var result = await _controller.GetLeadersAndDirectors(CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<EmployeeListItemDto>>().Subject;
            returnValue.Should().BeEquivalentTo(employees);
        }

        [Fact]
        public async Task Create_AsDirector_ReturnsCreatedWithEmployee()
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

            var createdEmployee = new EmployeeDto
            {
                Id = Guid.NewGuid(),
                FirstName = createDto.FirstName,
                LastName = createDto.LastName,
                FullName = "John Doe",
                Email = createDto.Email,
                DocumentNumber = createDto.DocumentNumber,
                BirthDate = createDto.BirthDate,
                Role = createDto.Role,
                Department = createDto.Department
            };

            _mockAuthService.Setup(service =>
                service.HasPermission(Role.Director, Role.Employee))
                .Returns(true);

            _mockEmployeeService.Setup(service =>
                service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEmployee);

            // Act
            var result = await _controller.Create(createDto, CancellationToken.None);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.ActionName.Should().Be(nameof(EmployeesController.GetById));
            createdResult.RouteValues["id"].Should().Be(createdEmployee.Id);
            
            var returnValue = createdResult.Value.Should().BeOfType<EmployeeDto>().Subject;
            returnValue.Should().BeEquivalentTo(createdEmployee);
        }

        [Fact]
        public async Task Create_WithNoPermission_ReturnsForbid()
        {
            // Arrange
            SetupUserWithRole(Role.Leader);
            
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Role = Role.Director, // Leader trying to create Director
                Department = "IT"
            };

            _mockAuthService.Setup(service =>
                service.HasPermission(Role.Leader, Role.Director))
                .Returns(false);

            // Act
            var result = await _controller.Create(createDto, CancellationToken.None);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task Create_WithDomainException_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Role = Role.Employee,
                Department = "IT"
            };

            _mockAuthService.Setup(service =>
                service.HasPermission(It.IsAny<Role>(), It.IsAny<Role>()))
                .Returns(true);

            _mockEmployeeService.Setup(service =>
                service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DomainException("Data de nascimento inválida."));

            // Act
            var result = await _controller.Create(createDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("inv");
        }

        [Fact]
        public async Task Update_WithValidData_ReturnsOkWithEmployee()
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
                Department = "IT"
            };

            var updatedEmployee = new EmployeeDto
            {
                Id = employeeId,
                FirstName = updateDto.FirstName,
                LastName = updateDto.LastName,
                FullName = "John Doe Updated",
                Email = updateDto.Email,
                BirthDate = updateDto.BirthDate,
                Role = updateDto.Role,
                Department = updateDto.Department
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedEmployee);

            _mockEmployeeService.Setup(service =>
                service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedEmployee);

            // Act
            var result = await _controller.Update(employeeId, updateDto, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<EmployeeDto>().Subject;
            returnValue.Should().BeEquivalentTo(updatedEmployee);
        }

        [Fact]
        public async Task Update_WithMismatchedIds_ReturnsBadRequest()
        {
            // Arrange
            var routeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = Guid.NewGuid(), // Different ID
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Role = Role.Employee,
                Department = "IT"
            };

            // Act
            var result = await _controller.Update(routeId, updateDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("URL");
        }

        [Fact]
        public async Task Update_WithEntityNotFoundException_ReturnsNotFound()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Role = Role.Employee,
                Department = "IT"
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new EntityNotFoundException("Funcionário", employeeId.ToString()));

            // Act
            var result = await _controller.Update(employeeId, updateDto, CancellationToken.None);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(employeeId.ToString());
        }

        [Fact]
        public async Task Update_LeaderTryingToEditDirector_ReturnsForbid()
        {
            // Arrange
            SetupUserWithRole(Role.Leader);
            
            var employeeId = Guid.NewGuid();
            var updateDto = new UpdateEmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Role = Role.Director, // Leader trying to edit Director
                Department = "IT"
            };

            var currentEmployee = new EmployeeDto
            {
                Id = employeeId,
                Role = Role.Director
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(currentEmployee);

            // Act
            var result = await _controller.Update(employeeId, updateDto, CancellationToken.None);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task UpdatePassword_WithValidData_ReturnsOk()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetupUserWithId(userId, Role.Employee);
            
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = userId,
                CurrentPassword = "oldPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };

            _mockEmployeeService.Setup(service =>
                service.UpdatePasswordAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdatePassword(userId, updateDto, CancellationToken.None);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
            responseJson.Should().Contain("sucesso");
        }

        [Fact]
        public async Task UpdatePassword_WithMismatchedIds_ReturnsBadRequest()
        {
            // Arrange
            var routeId = Guid.NewGuid();
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = Guid.NewGuid(), // Different ID
                CurrentPassword = "oldPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };

            // Act
            var result = await _controller.UpdatePassword(routeId, updateDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("URL");
        }

        [Fact]
        public async Task UpdatePassword_WithInvalidCredentials_ReturnsBadRequest()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetupUserWithId(userId, Role.Employee);
            
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = userId,
                CurrentPassword = "wrongPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };

            _mockEmployeeService.Setup(service =>
                service.UpdatePasswordAsync(updateDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidCredentialsException("Senha atual incorreta."));

            // Act
            var result = await _controller.UpdatePassword(userId, updateDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("incorreta");
        }

        [Fact]
        public async Task UpdatePassword_AsOtherUserWithoutDirectorRole_ReturnsForbid()
        {
            // Arrange
            var currentUserId = Guid.NewGuid();
            var targetUserId = Guid.NewGuid();
            SetupUserWithId(currentUserId, Role.Leader); // Leader trying to update someone else's password
            
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = targetUserId,
                CurrentPassword = "oldPassword",
                NewPassword = "newPassword",
                ConfirmNewPassword = "newPassword"
            };

            // Act
            var result = await _controller.UpdatePassword(targetUserId, updateDto, CancellationToken.None);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var employeeId = Guid.NewGuid();

            _mockEmployeeService.Setup(service =>
                service.DeleteAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(employeeId, CancellationToken.None);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task Delete_WithEntityNotFoundException_ReturnsNotFound()
        {
            // Arrange
            var employeeId = Guid.NewGuid();

            _mockEmployeeService.Setup(service =>
                service.DeleteAsync(employeeId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new EntityNotFoundException("Funcionário", employeeId.ToString()));

            // Act
            var result = await _controller.Delete(employeeId, CancellationToken.None);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(employeeId.ToString());
        }

        [Fact]
        public async Task UpdatePartial_WithValidData_ReturnsOkWithEmployee()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var partialUpdateDto = new EmployeePartialUpdateDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe Updated"
                // Only updating names, other fields not included
            };

            var updatedEmployee = new EmployeeDto
            {
                Id = employeeId,
                FirstName = partialUpdateDto.FirstName,
                LastName = partialUpdateDto.LastName,
                FullName = "John Doe Updated",
                Email = "john@example.com",
                BirthDate = new DateTime(1990, 1, 1),
                Role = Role.Employee,
                Department = "IT"
            };

            var currentEmployee = new EmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                Email = "john@example.com",
                BirthDate = new DateTime(1990, 1, 1),
                Role = Role.Employee,
                Department = "IT"
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(currentEmployee);

            _mockEmployeeService.Setup(service =>
                service.UpdatePartialAsync(partialUpdateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedEmployee);

            // Act
            var result = await _controller.UpdatePartial(employeeId, partialUpdateDto, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<EmployeeDto>().Subject;
            returnValue.Should().BeEquivalentTo(updatedEmployee);
        }

        [Fact]
        public async Task UpdatePhoneNumbers_WithValidData_ReturnsOkWithEmployee()
        {
            // Arrange
            var employeeId = Guid.NewGuid();
            var updatePhoneNumbersDto = new UpdatePhoneNumbersDto
            {
                Id = employeeId,
                PhoneNumbers = new List<PhoneNumberDto>
                {
                    new PhoneNumberDto { Type = PhoneType.Mobile, Number = "11999999999" },
                    new PhoneNumberDto { Type = PhoneType.Home, Number = "1134567890" }
                }
            };

            var currentEmployee = new EmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                Email = "john@example.com",
                Role = Role.Employee
            };

            var updatedEmployee = new EmployeeDto
            {
                Id = employeeId,
                FirstName = "John",
                LastName = "Doe",
                FullName = "John Doe",
                Email = "john@example.com",
                Role = Role.Employee,
                PhoneNumbers = updatePhoneNumbersDto.PhoneNumbers
            };

            _mockEmployeeService.Setup(service =>
                service.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(currentEmployee);

            _mockEmployeeService.Setup(service =>
                service.UpdatePhoneNumbersAsync(updatePhoneNumbersDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedEmployee);

            // Act
            var result = await _controller.UpdatePhoneNumbers(employeeId, updatePhoneNumbersDto, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<EmployeeDto>().Subject;
            returnValue.Should().BeEquivalentTo(updatedEmployee);
        }

        // Helper methods for setting up user context
        private void SetupUserWithRole(Role role)
        {
            var userId = Guid.NewGuid();
            SetupUserWithId(userId, role);
        }

        private void SetupUserWithId(Guid userId, Role role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role.ToString())
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }
    }
}