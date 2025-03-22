using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace CompanyManager.UnitTests.Application.Services
{
    public class DepartmentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IDepartmentRepository> _mockDepartmentRepository;
        private readonly Mock<ILogger<DepartmentService>> _mockLogger;
        private readonly DepartmentService _departmentService;

        public DepartmentServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockDepartmentRepository = new Mock<IDepartmentRepository>();
            _mockLogger = new Mock<ILogger<DepartmentService>>();
            
            // Setup UnitOfWork to return the mock repository
            _mockUnitOfWork.Setup(uow => uow.Departments).Returns(_mockDepartmentRepository.Object);
            
            // Create instance of the service to test
            _departmentService = new DepartmentService(
                _mockUnitOfWork.Object,
                _mockLogger.Object
            );
        }
        
        [Fact]
        public async Task GetAllAsync_ReturnsAllDepartments()
        {
            // Arrange
            var departments = new List<Department>
            {
                Department.Create("IT Department", "Information Technology"),
                Department.Create("HR Department", "Human Resources"),
                Department.Create("Finance", "Finance Department")
            };
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(departments);
            
            // Act
            var result = await _departmentService.GetAllAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(departments.Count);
            result.Select(d => d.Name).Should().Contain(departments.Select(d => d.Name));
        }
        
        [Fact]
        public async Task GetActiveAsync_ReturnsOnlyActiveDepartments()
        {
            // Arrange
            var activeDepartments = new List<Department>
            {
                Department.Create("IT Department", "Information Technology"),
                Department.Create("HR Department", "Human Resources")
            };
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(activeDepartments);
            
            // Act
            var result = await _departmentService.GetActiveAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(activeDepartments.Count);
            result.Select(d => d.Name).Should().Contain(activeDepartments.Select(d => d.Name));
        }
        
        [Fact]
        public async Task GetByIdAsync_WithValidId_ReturnsDepartment()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var department = Department.Create("IT Department", "Information Technology");
            
            // Use reflection to set the Id since it's a private setter
            typeof(Department).GetProperty("Id").SetValue(department, departmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(department);
            
            // Act
            var result = await _departmentService.GetByIdAsync(departmentId);
            
            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(departmentId);
            result.Name.Should().Be(department.Name);
        }
        
        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ThrowsDepartmentNotFoundException()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Department)null);
            
            // Act & Assert
            await Assert.ThrowsAsync<DepartmentNotFoundException>(() => 
                _departmentService.GetByIdAsync(departmentId));
        }
        
        [Fact]
        public async Task CreateAsync_WithValidData_ReturnsDepartmentDto()
        {
            // Arrange
            var createDto = new CreateDepartmentDto
            {
                Name = "IT Department",
                Description = "Information Technology"
            };
            
            _mockDepartmentRepository.Setup(repo => 
                repo.ExistsByNameAsync(createDto.Name, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
                
            _mockDepartmentRepository.Setup(repo => 
                repo.AddAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _departmentService.CreateAsync(createDto);
            
            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be(createDto.Name);
            result.Description.Should().Be(createDto.Description);
            result.IsActive.Should().BeTrue();
            
            _mockDepartmentRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task CreateAsync_WithExistingName_ThrowsValidationException()
        {
            // Arrange
            var createDto = new CreateDepartmentDto
            {
                Name = "IT Department",
                Description = "Information Technology"
            };
            
            _mockDepartmentRepository.Setup(repo => 
                repo.ExistsByNameAsync(createDto.Name, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            
            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => 
                _departmentService.CreateAsync(createDto));
                
            _mockDepartmentRepository.Verify(repo => 
                repo.AddAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        
        [Fact]
        public async Task UpdateAsync_WithValidData_ReturnsDepartmentDto()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var updateDto = new UpdateDepartmentDto
            {
                Id = departmentId,
                Name = "IT Department Updated",
                Description = "Information Technology Updated"
            };
            
            var existingDepartment = Department.Create("IT Department", "Information Technology");
            
            // Use reflection to set the Id since it's a private setter
            typeof(Department).GetProperty("Id").SetValue(existingDepartment, departmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingDepartment);
                
            _mockDepartmentRepository.Setup(repo => 
                repo.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Department> { existingDepartment });
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _departmentService.UpdateAsync(updateDto);
            
            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(departmentId);
            result.Name.Should().Be(updateDto.Name);
            result.Description.Should().Be(updateDto.Description);
            
            _mockDepartmentRepository.Verify(repo => 
                repo.Update(It.IsAny<Department>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task UpdateAsync_WithDuplicateName_ThrowsValidationException()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var otherDepartmentId = Guid.NewGuid();
            var updateDto = new UpdateDepartmentDto
            {
                Id = departmentId,
                Name = "IT Department",
                Description = "Updated Description"
            };
            
            var existingDepartment = Department.Create("HR Department", "Human Resources");
            var otherDepartment = Department.Create("IT Department", "Information Technology");
            
            // Use reflection to set the Ids
            typeof(Department).GetProperty("Id").SetValue(existingDepartment, departmentId);
            typeof(Department).GetProperty("Id").SetValue(otherDepartment, otherDepartmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingDepartment);
                
            _mockDepartmentRepository.Setup(repo => 
                repo.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Department> { existingDepartment, otherDepartment });
            
            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => 
                _departmentService.UpdateAsync(updateDto));
                
            _mockDepartmentRepository.Verify(repo => 
                repo.Update(It.IsAny<Department>()), Times.Never);
        }
        
        [Fact]
        public async Task ActivateAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var department = Department.Create("IT Department", "Information Technology");
            department.Deactivate(); // Make sure it's deactivated first
            
            // Use reflection to set the Id
            typeof(Department).GetProperty("Id").SetValue(department, departmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(department);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _departmentService.ActivateAsync(departmentId);
            
            // Assert
            result.Should().BeTrue();
            department.IsActive.Should().BeTrue();
            
            _mockDepartmentRepository.Verify(repo => 
                repo.Update(It.IsAny<Department>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task DeactivateAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var department = Department.Create("IT Department", "Information Technology");
            // Department is active by default
            
            // Use reflection to set the Id
            typeof(Department).GetProperty("Id").SetValue(department, departmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(department);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _departmentService.DeactivateAsync(departmentId);
            
            // Assert
            result.Should().BeTrue();
            department.IsActive.Should().BeFalse();
            
            _mockDepartmentRepository.Verify(repo => 
                repo.Update(It.IsAny<Department>()), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
        
        [Fact]
        public async Task DeleteAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            var departmentId = Guid.NewGuid();
            var department = Department.Create("IT Department", "Information Technology");
            
            // Use reflection to set the Id
            typeof(Department).GetProperty("Id").SetValue(department, departmentId);
            
            _mockDepartmentRepository.Setup(repo => 
                repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(department);
                
            _mockUnitOfWork.Setup(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);
            
            // Act
            var result = await _departmentService.DeleteAsync(departmentId);
            
            // Assert
            result.Should().BeTrue();
            
            _mockDepartmentRepository.Verify(repo => 
                repo.Remove(department), Times.Once);
                
            _mockUnitOfWork.Verify(uow => 
                uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}