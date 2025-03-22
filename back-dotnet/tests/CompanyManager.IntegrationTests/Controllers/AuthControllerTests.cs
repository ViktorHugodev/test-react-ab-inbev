using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Domain.Enums;
using CompanyManager.IntegrationTests.Helpers;

namespace CompanyManager.IntegrationTests.Controllers
{
    [Collection("TestServerCollection")]
    public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public AuthControllerTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
            
            // Seed test data
            try 
            {
                TestDataSeeder.SeedTestUsersAsync(factory).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in test setup: {ex.Message}");
                // Continue - tests will fail if setup fails, but we'll get clearer error messages
            }
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "wrongpassword"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetCurrentUser_WithoutAuthentication_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/auth/me");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsToken()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "admin@example.com",
                Password = "Admin@123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var content = await response.Content.ReadAsStringAsync();
            var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, _jsonOptions);

            authResponse.Should().NotBeNull();
            authResponse.Token.Should().NotBeNullOrEmpty();
            authResponse.Employee.Should().NotBeNull();
            authResponse.Employee.Email.Should().Be(loginDto.Email);
        }

        [Fact]
        public async Task GetCurrentUser_WithValidToken_ReturnsUserInfo()
        {
            // Arrange - Get a valid token by logging in
            var loginDto = new LoginDto
            {
                Email = "admin@example.com",
                Password = "Admin@123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            loginResponse.EnsureSuccessStatusCode();

            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(loginContent, _jsonOptions);

            // Setup authenticated client
            var authenticatedClient = _factory.CreateClient();
            authenticatedClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", authResponse.Token);

            // Act
            var response = await authenticatedClient.GetAsync("/api/auth/me");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var content = await response.Content.ReadAsStringAsync();
            var userInfo = JsonDocument.Parse(content).RootElement;

            userInfo.GetProperty("email").GetString().Should().Be(loginDto.Email);
        }
    }
}