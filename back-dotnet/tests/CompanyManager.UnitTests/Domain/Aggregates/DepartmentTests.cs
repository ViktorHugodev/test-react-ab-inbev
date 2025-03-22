using System;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Exceptions;
using Xunit;
using FluentAssertions;

namespace CompanyManager.UnitTests.Domain.Aggregates
{
    public class DepartmentTests
    {
        [Fact]
        public void Create_WithValidData_ShouldCreateDepartment()
        {
            // Arrange
            string name = "IT Department";
            string description = "Information Technology Department";
            
            // Act
            var department = Department.Create(name, description);
            
            // Assert
            department.Should().NotBeNull();
            department.Name.Should().Be(name);
            department.Description.Should().Be(description);
            department.IsActive.Should().BeTrue();
            department.Id.Should().NotBe(Guid.Empty);
            department.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            department.UpdatedAt.Should().BeNull();
        }
        
        [Fact]
        public void Create_WithNullDescription_ShouldCreateDepartmentWithEmptyDescription()
        {
            // Arrange
            string name = "HR Department";
            string description = null;
            
            // Act
            var department = Department.Create(name, description);
            
            // Assert
            department.Should().NotBeNull();
            department.Name.Should().Be(name);
            department.Description.Should().Be(string.Empty);
        }
        
        [Theory]
        [InlineData("", "O nome do departamento é obrigatório.")]
        [InlineData(" ", "O nome do departamento é obrigatório.")]
        [InlineData(null, "O nome do departamento é obrigatório.")]
        [InlineData("A", "O nome do departamento deve ter pelo menos 2 caracteres.")]
        [InlineData("Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "O nome do departamento não pode exceder 50 caracteres.")]
        public void Create_WithInvalidName_ShouldThrowDomainException(string invalidName, string expectedErrorMessage)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                Department.Create(invalidName, "Valid Description"));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Fact]
        public void Update_WithValidData_ShouldUpdateDepartment()
        {
            // Arrange
            var department = Department.Create("Old Department", "Old Description");
            string newName = "New Department";
            string newDescription = "New Description";
            
            // Act
            department.Update(newName, newDescription);
            
            // Assert
            department.Name.Should().Be(newName);
            department.Description.Should().Be(newDescription);
            department.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }
        
        [Fact]
        public void Update_WithNullDescription_ShouldUpdateWithEmptyDescription()
        {
            // Arrange
            var department = Department.Create("Department", "Old Description");
            
            // Act
            department.Update("Updated Department", null);
            
            // Assert
            department.Name.Should().Be("Updated Department");
            department.Description.Should().Be(string.Empty);
        }
        
        [Theory]
        [InlineData("", "O nome do departamento é obrigatório.")]
        [InlineData(" ", "O nome do departamento é obrigatório.")]
        [InlineData(null, "O nome do departamento é obrigatório.")]
        [InlineData("A", "O nome do departamento deve ter pelo menos 2 caracteres.")]
        [InlineData("Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "O nome do departamento não pode exceder 50 caracteres.")]
        public void Update_WithInvalidName_ShouldThrowDomainException(string invalidName, string expectedErrorMessage)
        {
            // Arrange
            var department = Department.Create("Valid Department", "Valid Description");
            
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                department.Update(invalidName, "Valid Description"));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Fact]
        public void Activate_ShouldSetIsActiveToTrue()
        {
            // Arrange
            var department = Department.Create("Department", "Description");
            department.Deactivate(); // Ensure it's deactivated first
            
            // Act
            department.Activate();
            
            // Assert
            department.IsActive.Should().BeTrue();
            department.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }
        
        [Fact]
        public void Deactivate_ShouldSetIsActiveToFalse()
        {
            // Arrange
            var department = Department.Create("Department", "Description");
            
            // Act
            department.Deactivate();
            
            // Assert
            department.IsActive.Should().BeFalse();
            department.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }
        
        [Fact]
        public void SetCreatedAt_ShouldUpdateCreatedAtProperty()
        {
            // Arrange
            var department = Department.Create("Department", "Description");
            var newCreatedAt = DateTime.UtcNow.AddDays(-5);
            
            // Act
            department.SetCreatedAt(newCreatedAt);
            
            // Assert
            department.CreatedAt.Should().Be(newCreatedAt);
        }
        
        [Fact]
        public void SetUpdatedAt_ShouldUpdateUpdatedAtProperty()
        {
            // Arrange
            var department = Department.Create("Department", "Description");
            var newUpdatedAt = DateTime.UtcNow.AddDays(-2);
            
            // Act
            department.SetUpdatedAt(newUpdatedAt);
            
            // Assert
            department.UpdatedAt.Should().Be(newUpdatedAt);
        }
    }
}