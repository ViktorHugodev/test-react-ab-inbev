using System;
using System.Linq;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.ValueObjects;
using Xunit;
using FluentAssertions;

namespace CompanyManager.UnitTests.Domain.Aggregates
{
    public class EmployeeTests
    {
        // Dados válidos para os testes
        private readonly string _validFirstName = "John";
        private readonly string _validLastName = "Doe";
        private readonly string _validEmail = "john.doe@example.com";
        private readonly string _validDocumentNumber = "12345678900";
        private readonly DateTime _validBirthDate = DateTime.UtcNow.AddYears(-25); // 25 anos
        private readonly string _validPassword = "hashedPassword123";
        private readonly Role _validRole = Role.Employee;
        private readonly string _validDepartment = "IT Department";
        
        [Fact]
        public void Employee_Create_WithValidData_ShouldCreateEmployee()
        {
            // Act
            var employee = Employee.Create(
                _validFirstName,
                _validLastName,
                _validEmail,
                _validDocumentNumber,
                _validBirthDate,
                _validPassword,
                _validRole,
                _validDepartment
            );
            
            // Assert
            employee.Should().NotBeNull();
            employee.FirstName.Should().Be(_validFirstName);
            employee.LastName.Should().Be(_validLastName);
            employee.Email.Should().Be(_validEmail.ToLower());
            employee.DocumentNumber.Should().Be(_validDocumentNumber);
            employee.BirthDate.Should().Be(_validBirthDate);
            employee.PasswordHash.Should().Be(_validPassword);
            employee.Role.Should().Be(_validRole);
            employee.Department.Should().Be(_validDepartment);
            employee.ManagerId.Should().BeNull();
            employee.Id.Should().NotBe(Guid.Empty);
            employee.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            employee.UpdatedAt.Should().BeNull();
        }
        
        [Fact]
        public void Employee_Create_WithManager_ShouldCreateEmployeeWithManager()
        {
            // Arrange
            var managerId = Guid.NewGuid();
            
            // Act
            var employee = Employee.Create(
                _validFirstName, 
                _validLastName,
                _validEmail,
                _validDocumentNumber,
                _validBirthDate,
                _validPassword,
                _validRole,
                _validDepartment,
                managerId
            );
            
            // Assert
            employee.Should().NotBeNull();
            employee.ManagerId.Should().Be(managerId);
        }
        
        [Theory]
        [InlineData("", "Doe", "O nome é obrigatório.")]
        [InlineData(" ", "Doe", "O nome é obrigatório.")]
        [InlineData(null, "Doe", "O nome é obrigatório.")]
        [InlineData("John", "", "O sobrenome é obrigatório.")]
        [InlineData("John", " ", "O sobrenome é obrigatório.")]
        [InlineData("John", null, "O sobrenome é obrigatório.")]
        public void Employee_Create_WithInvalidName_ShouldThrowDomainException(
            string firstName, string lastName, string expectedErrorMessage)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => Employee.Create(
                firstName,
                lastName,
                _validEmail,
                _validDocumentNumber,
                _validBirthDate,
                _validPassword,
                _validRole,
                _validDepartment
            ));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Theory]
        [InlineData("", "O email é obrigatório.")]
        [InlineData(" ", "O email é obrigatório.")]
        [InlineData(null, "O email é obrigatório.")]
        [InlineData("invalid-email", "O email informado não é válido.")]
        [InlineData("invalid@", "O email informado não é válido.")]
        [InlineData("@invalid.com", "O email informado não é válido.")]
        public void Employee_Create_WithInvalidEmail_ShouldThrowDomainException(
            string email, string expectedErrorMessage)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => Employee.Create(
                _validFirstName,
                _validLastName,
                email,
                _validDocumentNumber,
                _validBirthDate,
                _validPassword,
                _validRole,
                _validDepartment
            ));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Theory]
        [InlineData("", "O número do documento é obrigatório.")]
        [InlineData(" ", "O número do documento é obrigatório.")]
        [InlineData(null, "O número do documento é obrigatório.")]
        public void Employee_Create_WithInvalidDocumentNumber_ShouldThrowDomainException(
            string documentNumber, string expectedErrorMessage)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => Employee.Create(
                _validFirstName,
                _validLastName,
                _validEmail,
                documentNumber,
                _validBirthDate,
                _validPassword,
                _validRole,
                _validDepartment
            ));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Fact]
        public void Employee_Create_WithAgeLessThan18_ShouldThrowDomainException()
        {
            // Arrange
            var invalidBirthDate = DateTime.UtcNow.AddYears(-17); // 17 anos
            
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => Employee.Create(
                _validFirstName,
                _validLastName,
                _validEmail,
                _validDocumentNumber,
                invalidBirthDate,
                _validPassword,
                _validRole,
                _validDepartment
            ));
            
            exception.Message.Should().Be("O funcionário deve ter pelo menos 18 anos.");
        }
        
        [Fact]
        public void Employee_Update_WithValidData_ShouldUpdateEmployee()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var updatedFirstName = "Jane";
            var updatedLastName = "Smith";
            var updatedEmail = "jane.smith@example.com";
            var updatedBirthDate = DateTime.UtcNow.AddYears(-30);
            var updatedRole = Role.Leader;
            var updatedDepartment = "HR Department";
            var updatedManagerId = Guid.NewGuid();
            
            // Act
            employee.Update(
                updatedFirstName,
                updatedLastName,
                updatedEmail,
                updatedBirthDate,
                updatedRole,
                updatedDepartment,
                updatedManagerId
            );
            
            // Assert
            employee.FirstName.Should().Be(updatedFirstName);
            employee.LastName.Should().Be(updatedLastName);
            employee.Email.Should().Be(updatedEmail.ToLower());
            employee.BirthDate.Should().Be(updatedBirthDate);
            employee.Role.Should().Be(updatedRole);
            employee.Department.Should().Be(updatedDepartment);
            employee.ManagerId.Should().Be(updatedManagerId);
            employee.UpdatedAt.Should().NotBeNull();
            employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }
        
        [Fact]
        public void FullName_ShouldConcatenateFirstAndLastName()
        {
            // Arrange
            var employee = CreateValidEmployee();
            
            // Act & Assert
            employee.FullName.Should().Be($"{_validFirstName} {_validLastName}");
        }
        
        [Fact]
        public void UpdatePassword_WithValidPassword_ShouldUpdatePasswordHash()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var newPasswordHash = "newHashedPassword456";
            
            // Act
            employee.UpdatePassword(newPasswordHash);
            
            // Assert
            employee.PasswordHash.Should().Be(newPasswordHash);
            employee.UpdatedAt.Should().NotBeNull();
            employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }
        
        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void UpdatePassword_WithInvalidPassword_ShouldThrowDomainException(string invalidPassword)
        {
            // Arrange
            var employee = CreateValidEmployee();
            
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                employee.UpdatePassword(invalidPassword));
            
            exception.Message.Should().Be("A senha não pode ser vazia.");
        }
        
        [Fact]
        public void SetPasswordHash_WithValidPassword_ShouldSetPasswordHash()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var newPasswordHash = "newHashedPassword456";
            
            // Act
            employee.SetPasswordHash(newPasswordHash);
            
            // Assert
            employee.PasswordHash.Should().Be(newPasswordHash);
        }
        
        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void SetPasswordHash_WithInvalidPassword_ShouldThrowDomainException(string invalidPassword)
        {
            // Arrange
            var employee = CreateValidEmployee();
            
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                employee.SetPasswordHash(invalidPassword));
            
            exception.Message.Should().Be("A senha não pode ser vazia.");
        }
        
        [Fact]
        public void AddPhoneNumber_ShouldAddPhoneNumberToCollection()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var phoneNumber = "123456789";
            var phoneType = PhoneType.Mobile;
            
            // Act
            employee.AddPhoneNumber(phoneNumber, phoneType);
            
            // Assert
            employee.PhoneNumbers.Should().HaveCount(1);
            var addedPhone = employee.PhoneNumbers.First();
            addedPhone.Number.Should().Be("123456789"); // NormalizePhoneNumber removes non-digit characters
            addedPhone.Type.Should().Be(phoneType);
            employee.UpdatedAt.Should().NotBeNull();
        }
        
        [Fact]
        public void RemovePhoneNumber_WithExistingId_ShouldRemovePhoneNumberFromCollection()
        {
            // Arrange
            var employee = CreateValidEmployee();
            employee.AddPhoneNumber("123456789", PhoneType.Mobile);
            var phoneNumberId = employee.PhoneNumbers.First().Id;
            
            // Act
            employee.RemovePhoneNumber(phoneNumberId);
            
            // Assert
            employee.PhoneNumbers.Should().BeEmpty();
            employee.UpdatedAt.Should().NotBeNull();
        }
        
        [Fact]
        public void RemovePhoneNumber_WithNonExistingId_ShouldNotModifyCollection()
        {
            // Arrange
            var employee = CreateValidEmployee();
            employee.AddPhoneNumber("123456789", PhoneType.Mobile);
            var nonExistingId = Guid.NewGuid();
            
            // Act
            employee.RemovePhoneNumber(nonExistingId);
            
            // Assert
            employee.PhoneNumbers.Should().HaveCount(1);
        }
        
        [Theory]
        [InlineData(Role.Director, Role.Director, true)]
        [InlineData(Role.Director, Role.Leader, true)]
        [InlineData(Role.Director, Role.Employee, true)]
        [InlineData(Role.Leader, Role.Director, false)]
        [InlineData(Role.Leader, Role.Leader, false)]
        [InlineData(Role.Leader, Role.Employee, true)]
        [InlineData(Role.Employee, Role.Director, false)]
        [InlineData(Role.Employee, Role.Leader, false)]
        [InlineData(Role.Employee, Role.Employee, false)]
        public void CanManage_ShouldReturnCorrectValue(Role managerRole, Role subordinateRole, bool expected)
        {
            // Arrange
            var employee = new Employee(
                _validFirstName,
                _validLastName,
                _validEmail,
                _validDocumentNumber,
                _validBirthDate,
                managerRole,
                _validDepartment
            );
            
            // Act
            var result = employee.CanManage(subordinateRole);
            
            // Assert
            result.Should().Be(expected);
        }
        
        [Fact]
        public void SetCreatedAt_ShouldUpdateCreatedAtProperty()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var newCreatedAt = DateTime.UtcNow.AddDays(-5);
            
            // Act
            employee.SetCreatedAt(newCreatedAt);
            
            // Assert
            employee.CreatedAt.Should().Be(newCreatedAt);
        }
        
        [Fact]
        public void SetUpdatedAt_ShouldUpdateUpdatedAtProperty()
        {
            // Arrange
            var employee = CreateValidEmployee();
            var newUpdatedAt = DateTime.UtcNow.AddDays(-2);
            
            // Act
            employee.SetUpdatedAt(newUpdatedAt);
            
            // Assert
            employee.UpdatedAt.Should().Be(newUpdatedAt);
        }
        
        // Helper method to create a valid employee
        private Employee CreateValidEmployee()
        {
            return new Employee(
                _validFirstName,
                _validLastName,
                _validEmail,
                _validDocumentNumber,
                _validBirthDate,
                _validRole,
                _validDepartment
            );
        }
    }
}