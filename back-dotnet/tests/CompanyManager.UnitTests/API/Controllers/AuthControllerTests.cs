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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyManager.UnitTests.API.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkWithAuthResponse()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "password123"
            };

            var authResponse = new AuthResponseDto
            {
                Token = "test-token",
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Employee = new EmployeeDto
                {
                    Id = Guid.NewGuid(),
                    Email = loginDto.Email,
                    FullName = "Test User",
                    Role = Role.Leader
                }
            };

            _mockAuthService.Setup(service =>
                service.LoginAsync(loginDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(loginDto, CancellationToken.None);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnValue = okResult.Value.Should().BeAssignableTo<AuthResponseDto>().Subject;
            returnValue.Should().BeEquivalentTo(authResponse);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "wrongpassword"
            };

            _mockAuthService.Setup(service =>
                service.LoginAsync(loginDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidCredentialsException("Email ou senha inválidos."));

            // Act
            var result = await _controller.Login(loginDto, CancellationToken.None);

            // Assert
            var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            var message = unauthorizedResult.Value as object;
            var messageJson = System.Text.Json.JsonSerializer.Serialize(message);
            messageJson.Should().Contain("inv");
        }

        [Fact]
        public async Task Login_WithServerError_ReturnsInternalServerError()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "password123"
            };

            _mockAuthService.Setup(service =>
                service.LoginAsync(loginDto, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ApplicationException("Database connection error"));

            // Act
            var result = await _controller.Login(loginDto, CancellationToken.None);

            // Assert
            var statusCodeResult = result.Result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        }

        [Fact]
        public async Task GetCurrentUser_WithValidEmailClaim_ReturnsOkWithUserInfo()
        {
            // Arrange
            var email = "test@example.com";
            var employee = new EmployeeDto
            {
                Id = Guid.NewGuid(),
                Email = email,
                FullName = "Test User",
                Role = Role.Leader
            };

            _mockAuthService.Setup(service =>
                service.GetEmployeeByEmailAsync(email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // Setup claims principal with email claim
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Set HttpContext with ClaimsPrincipal
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.GetCurrentUser(CancellationToken.None);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var userInfo = okResult.Value;
            var userInfoJson = System.Text.Json.JsonSerializer.Serialize(userInfo);
            userInfoJson.Should().Contain(email);
            userInfoJson.Should().Contain(employee.FullName);
        }

        [Fact]
        public async Task GetCurrentUser_WithValidIdClaim_ReturnsOkWithUserInfo()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var employee = new EmployeeDto
            {
                Id = userId,
                Email = "test@example.com",
                FullName = "Test User",
                Role = Role.Leader
            };

            _mockAuthService.Setup(service =>
                service.GetEmployeeById(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // Setup claims principal with sub claim (NameIdentifier)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Set HttpContext with ClaimsPrincipal
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.GetCurrentUser(CancellationToken.None);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var userInfo = okResult.Value;
            var userInfoJson = System.Text.Json.JsonSerializer.Serialize(userInfo);
            userInfoJson.Should().Contain(userId.ToString());
            userInfoJson.Should().Contain(employee.Email);
        }

        [Fact]
        public async Task GetCurrentUser_WithNoValidClaims_ReturnsUnauthorized()
        {
            // Arrange - setup claims principal without the required claims
            var claims = new List<Claim>
            {
                new Claim("randomClaim", "randomValue")
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Set HttpContext with ClaimsPrincipal
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.GetCurrentUser(CancellationToken.None);

            // Assert
            var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            var message = unauthorizedResult.Value as object;
            var messageJson = System.Text.Json.JsonSerializer.Serialize(message);
            messageJson.Should().Contain("n\\u00E3o encontrado");
        }
    }
}