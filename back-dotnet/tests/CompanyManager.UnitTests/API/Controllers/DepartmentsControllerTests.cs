using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.API.Controllers;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyManager.UnitTests.API.Controllers
{
    public class DepartmentsControllerTests
    {
        private readonly Mock<IDepartmentService> _mockDepartmentService;
        private readonly Mock<ILogger<DepartmentsController>> _mockLogger;
        private readonly DepartmentsController _controller;

        public DepartmentsControllerTests()
        {
            _mockDepartmentService = new Mock<IDepartmentService>();
            _mockLogger = new Mock<ILogger<DepartmentsController>>();
            _controller = new DepartmentsController(_mockDepartmentService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkWithDepartments()
        {
            // Arrange
            var departments = new List<DepartmentDto>
            {
                new DepartmentDto { Id = Guid.NewGuid(), Name = "IT Department", Description = "Information Technology", IsActive = true },
                new DepartmentDto { Id = Guid.NewGuid(), Name = "HR Department", Description = "Human Resources", IsActive = true }
            };

            _mockDepartmentService.Setup(service =>
                service.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(departments);

            // Act
            var result = await _controller.GetAll(CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<DepartmentDto>>().Subject;
            returnValue.Should().BeEquivalentTo(departments);
        }

        [Fact]
        public async Task GetActive_ReturnsOkWithActiveDepartments()
        {
            // Arrange
            var activeDepartments = new List<DepartmentDto>
            {
                new DepartmentDto { Id = Guid.NewGuid(), Name = "IT Department", Description = "Information Technology", IsActive = true }
            };

            _mockDepartmentService.Setup(service =>
                service.GetActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(activeDepartments);

            // Act
            var result = await _controller.GetActive(CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<IEnumerable<DepartmentDto>>().Subject;
            returnValue.Should().BeEquivalentTo(activeDepartments);
        }

        [Fact]
        public async Task GetById_WithValidId_ReturnsOkWithDepartment()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var department = new DepartmentDto 
            { 
                Id = departmentId, 
                Name = "IT Department", 
                Description = "Information Technology", 
                IsActive = true 
            };

            _mockDepartmentService.Setup(service =>
                service.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(department);

            // Act
            var result = await _controller.GetById(departmentId, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<DepartmentDto>().Subject;
            returnValue.Should().BeEquivalentTo(department);
        }

        [Fact]
        public async Task GetById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DepartmentNotFoundException(departmentId));

            // Act
            var result = await _controller.GetById(departmentId, CancellationToken.None);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(departmentId.ToString());
        }

        [Fact]
        public async Task Create_WithValidData_ReturnsCreatedWithDepartment()
        {
            // Arrange
            var createDto = new CreateDepartmentDto
            {
                Name = "IT Department",
                Description = "Information Technology"
            };

            var createdDepartment = new DepartmentDto
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockDepartmentService.Setup(service =>
                service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDepartment);

            // Act
            var result = await _controller.Create(createDto, CancellationToken.None);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.ActionName.Should().Be(nameof(DepartmentsController.GetById));
            createdResult.RouteValues["id"].Should().Be(createdDepartment.Id);
            
            var returnValue = createdResult.Value.Should().BeOfType<DepartmentDto>().Subject;
            returnValue.Should().BeEquivalentTo(createdDepartment);
        }

        [Fact]
        public async Task Create_WithDuplicateName_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateDepartmentDto
            {
                Name = "IT Department",
                Description = "Information Technology"
            };

            _mockDepartmentService.Setup(service =>
                service.CreateAsync(createDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ValidationException("Já existe um departamento com este nome."));

            // Act
            var result = await _controller.Create(createDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("existe");
        }

        [Fact]
        public async Task Update_WithValidData_ReturnsOkWithDepartment()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var updateDto = new UpdateDepartmentDto
            {
                Id = departmentId,
                Name = "IT Department Updated",
                Description = "Information Technology Updated"
            };

            var updatedDepartment = new DepartmentDto
            {
                Id = departmentId,
                Name = updateDto.Name,
                Description = updateDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow
            };

            _mockDepartmentService.Setup(service =>
                service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedDepartment);

            // Act
            var result = await _controller.Update(departmentId, updateDto, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeOfType<DepartmentDto>().Subject;
            returnValue.Should().BeEquivalentTo(updatedDepartment);
        }

        [Fact]
        public async Task Update_WithMismatchedIds_ReturnsBadRequest()
        {
            // Arrange
            var routeId = Guid.NewGuid();
            var updateDto = new UpdateDepartmentDto
            {
                Id = Guid.NewGuid(), // Different ID
                Name = "IT Department Updated",
                Description = "Information Technology Updated"
            };

            // Act
            var result = await _controller.Update(routeId, updateDto, CancellationToken.None);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(badRequestResult.Value);
            responseJson.Should().Contain("URL");
        }

        [Fact]
        public async Task Update_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var updateDto = new UpdateDepartmentDto
            {
                Id = departmentId,
                Name = "IT Department Updated",
                Description = "Information Technology Updated"
            };

            _mockDepartmentService.Setup(service =>
                service.UpdateAsync(updateDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DepartmentNotFoundException(departmentId));

            // Act
            var result = await _controller.Update(departmentId, updateDto, CancellationToken.None);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(departmentId.ToString());
        }

        [Fact]
        public async Task Activate_WithValidId_ReturnsOk()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.ActivateAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Activate(departmentId, CancellationToken.None);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
            responseJson.Should().Contain("sucesso");
        }

        [Fact]
        public async Task Activate_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.ActivateAsync(departmentId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DepartmentNotFoundException(departmentId));

            // Act
            var result = await _controller.Activate(departmentId, CancellationToken.None);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(departmentId.ToString());
        }

        [Fact]
        public async Task Deactivate_WithValidId_ReturnsOk()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.DeactivateAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Deactivate(departmentId, CancellationToken.None);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
            responseJson.Should().Contain("sucesso");
        }

        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.DeleteAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(departmentId, CancellationToken.None);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task Delete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var departmentId = Guid.NewGuid();

            _mockDepartmentService.Setup(service =>
                service.DeleteAsync(departmentId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DepartmentNotFoundException(departmentId));

            // Act
            var result = await _controller.Delete(departmentId, CancellationToken.None);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var responseJson = System.Text.Json.JsonSerializer.Serialize(notFoundResult.Value);
            responseJson.Should().Contain(departmentId.ToString());
        }
    }
}