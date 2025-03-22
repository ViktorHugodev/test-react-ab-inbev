using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CompanyManager.UnitTests.Application.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IEmployeeRepository> _mockEmployeeRepository;
        private readonly Mock<IOptions<JwtSettings>> _mockJwtSettings;
        private readonly Mock<ILogger<AuthService>> _mockLogger;
        private readonly JwtSettings _jwtSettings;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockEmployeeRepository = new Mock<IEmployeeRepository>();
            _mockLogger = new Mock<ILogger<AuthService>>();
            
            // Setup JWT settings for testing
            _jwtSettings = new JwtSettings
            {
                Secret = "super_secret_key_for_testing_at_least_32_chars",
                ExpiryMinutes = 60,
                Issuer = "test-issuer",
                Audience = "test-audience"
            };
            
            _mockJwtSettings = new Mock<IOptions<JwtSettings>>();
            _mockJwtSettings.Setup(x => x.Value).Returns(_jwtSettings);
            
            // Setup UnitOfWork to return the mock repository
            _mockUnitOfWork.Setup(uow => uow.Employees).Returns(_mockEmployeeRepository.Object);
            
            // Create instance of the service to test
            _authService = new AuthService(
                _mockUnitOfWork.Object,
                _mockJwtSettings.Object,
                _mockLogger.Object
            );
        }
        
        [Fact]
        public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "password123"
            };
            
            var employee = CreateTestEmployee();
            
            // BCrypt hash for "password123"
            employee.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword("password123"));
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByEmailAsync(loginDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            
            // Act
            var result = await _authService.LoginAsync(loginDto);
            
            // Assert
            result.Should().NotBeNull();
            result.Token.Should().NotBeNullOrEmpty();
            result.Employee.Should().NotBeNull();
            result.Employee.Email.Should().Be(loginDto.Email);
            result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
        }
        
        [Fact]
        public async Task LoginAsync_WithInvalidEmail_ThrowsInvalidCredentialsException()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "password123"
            };
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByEmailAsync(loginDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employee)null);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidCredentialsException>(() => 
                _authService.LoginAsync(loginDto));
        }
        
        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ThrowsInvalidCredentialsException()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "wrongpassword"
            };
            
            var employee = CreateTestEmployee();
            
            // BCrypt hash for "password123" (different from login password)
            employee.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword("password123"));
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByEmailAsync(loginDto.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidCredentialsException>(() => 
                _authService.LoginAsync(loginDto));
        }
        
        [Fact]
        public void HashPassword_ReturnsValidBCryptHash()
        {
            // Arrange
            var password = "password123";
            
            // Act
            var hash = _authService.HashPassword(password);
            
            // Assert
            hash.Should().NotBeNullOrEmpty();
            BCrypt.Net.BCrypt.Verify(password, hash).Should().BeTrue();
        }
        
        [Fact]
        public async Task VerifyPasswordAsync_WithCorrectPassword_ReturnsTrue()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password123";
            
            var employee = CreateTestEmployee();
            employee.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword(password));
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            
            // Act
            var result = await _authService.VerifyPasswordAsync(email, password);
            
            // Assert
            result.Should().BeTrue();
        }
        
        [Fact]
        public async Task VerifyPasswordAsync_WithIncorrectPassword_ReturnsFalse()
        {
            // Arrange
            var email = "test@example.com";
            var correctPassword = "password123";
            var wrongPassword = "wrongpassword";
            
            var employee = CreateTestEmployee();
            employee.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword(correctPassword));
            
            _mockEmployeeRepository.Setup(repo => 
                repo.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);
            
            // Act
            var result = await _authService.VerifyPasswordAsync(email, wrongPassword);
            
            // Assert
            result.Should().BeFalse();
        }
        
        [Theory]
        [InlineData(Role.Director, Role.Director, true)]
        [InlineData(Role.Director, Role.Leader, true)]
        [InlineData(Role.Leader, Role.Leader, true)]
        [InlineData(Role.Leader, Role.Director, false)]
        public void HasPermission_ChecksRolePermissions_Correctly(
            Role currentUserRole, Role requiredRole, bool expectedResult)
        {
            // Act
            var result = _authService.HasPermission(currentUserRole, requiredRole);
            
            // Assert
            result.Should().Be(expectedResult);
        }
        
        [Fact]
        public void GenerateJwtToken_ReturnsValidToken()
        {
            // Arrange
            var employee = new EmployeeDto
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                FullName = "Test User",
                Role = Role.Leader
            };
            
            // Act
            var token = _authService.GenerateJwtToken(employee);
            
            // Assert
            token.Should().NotBeNullOrEmpty();
        }
        
        private Employee CreateTestEmployee()
        {
            return new Employee(
                "Test",
                "User",
                "test@example.com",
                "123456789",
                new DateTime(1990, 1, 1),
                Role.Leader,
                "IT",
                null
            );
        }
    }
}