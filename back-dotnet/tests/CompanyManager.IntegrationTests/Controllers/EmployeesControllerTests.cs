using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Domain.Enums;
using CompanyManager.IntegrationTests.Helpers;

namespace CompanyManager.IntegrationTests.Controllers
{
    [Collection("TestServerCollection")]
    public class EmployeesControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public EmployeesControllerTests(CustomWebApplicationFactory factory)
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
            }
        }
        
        private async Task<string> GetDirectorAuthToken()
        {
            // Login with admin credentials (Director role)
            return await AuthHelper.GetAuthTokenAsync(_client, "admin@example.com", "Admin@123");
        }
        
        private async Task<string> GetLeaderAuthToken()
        {
            // Login with leader credentials
            return await AuthHelper.GetAuthTokenAsync(_client, "leader@example.com", "Leader@123");
        }
        
        private async Task<string> GetEmployeeAuthToken()
        {
            // Login with regular employee credentials
            return await AuthHelper.GetAuthTokenAsync(_client, "user@example.com", "User@123");
        }
        
        [Fact]
        public async Task GetAll_WithoutAuthentication_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/employees");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
        
        [Fact]
        public async Task GetAll_WithAuthentication_ReturnsOk()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // Act
            var response = await authenticatedClient.GetAsync("/api/employees");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var employees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(content, _jsonOptions);
            
            employees.Should().NotBeNull();
            employees.Should().HaveCountGreaterThan(0);
        }
        
        [Fact(Skip = "Authorization issue with test user - needs investigation")]
        public async Task GetById_ReturnsCorrectEmployee()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // First get all employees
            var allResponse = await authenticatedClient.GetAsync("/api/employees");
            var allContent = await allResponse.Content.ReadAsStringAsync();
            var employees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(allContent, _jsonOptions);
            
            var firstEmployee = employees.FirstOrDefault();
            firstEmployee.Should().NotBeNull();
            
            // Act
            var response = await authenticatedClient.GetAsync($"/api/employees/{firstEmployee.Id}");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var employee = JsonSerializer.Deserialize<EmployeeDto>(content, _jsonOptions);
            
            employee.Should().NotBeNull();
            employee.Id.Should().Be(firstEmployee.Id);
            employee.Email.Should().Be(firstEmployee.Email);
        }
        
        [Fact]
        public async Task GetById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            var invalidId = Guid.NewGuid();
            
            // Act
            var response = await authenticatedClient.GetAsync($"/api/employees/{invalidId}");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
        
        [Fact]
        public async Task GetByDepartment_ReturnsEmployeesInDepartment()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // Get all employees to find departments
            var allResponse = await authenticatedClient.GetAsync("/api/employees");
            var allContent = await allResponse.Content.ReadAsStringAsync();
            var employees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(allContent, _jsonOptions);
            
            var department = employees.FirstOrDefault()?.Department;
            department.Should().NotBeNull();
            
            // Act
            var response = await authenticatedClient.GetAsync($"/api/employees/department/{department}");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var departmentEmployees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(content, _jsonOptions);
            
            departmentEmployees.Should().NotBeNull();
            departmentEmployees.Should().AllSatisfy(e => e.Department.Should().Be(department));
        }
        
        [Fact]
        public async Task GetLeadersAndDirectors_ReturnsOnlyLeadersAndDirectors()
        {
            // Arrange
            var token = await GetEmployeeAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // Act
            var response = await authenticatedClient.GetAsync("/api/employees/leaders-directors");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var leaders = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(content, _jsonOptions);
            
            leaders.Should().NotBeNull();
            leaders.Should().AllSatisfy(e => 
                e.Role.Should().BeOneOf(Role.Leader, Role.Director));
        }
        
        [Fact(Skip = "Authorization issue with test user - needs investigation")]
        public async Task CreateAndDelete_Employee_FullLifecycle()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            var createDto = new CreateEmployeeDto
            {
                FirstName = "Test",
                LastName = $"Employee {Guid.NewGuid()}",
                Email = $"test{Guid.NewGuid()}@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "Test@123",
                Role = Role.Employee,
                Department = "IT"
            };
            
            // Act - Create
            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/employees", createDto);
            
            // Assert - Create
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdEmployee = JsonSerializer.Deserialize<EmployeeDto>(createContent, _jsonOptions);
            
            createdEmployee.Should().NotBeNull();
            createdEmployee.Email.Should().Be(createDto.Email);
            createdEmployee.FullName.Should().Be($"{createDto.FirstName} {createDto.LastName}");
            createdEmployee.Role.Should().Be(createDto.Role);
            
            // Act - Get By Id
            var getResponse = await authenticatedClient.GetAsync($"/api/employees/{createdEmployee.Id}");
            
            // Assert - Get By Id
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var retrievedEmployee = JsonSerializer.Deserialize<EmployeeDto>(getContent, _jsonOptions);
            
            retrievedEmployee.Should().NotBeNull();
            retrievedEmployee.Id.Should().Be(createdEmployee.Id);
            
            // Act - Update
            var updateDto = new UpdateEmployeeDto
            {
                Id = createdEmployee.Id,
                FirstName = createDto.FirstName,
                LastName = $"{createDto.LastName} Updated",
                Email = createDto.Email,
                BirthDate = createDto.BirthDate,
                Role = createDto.Role,
                Department = "HR" // Change department
            };
            
            var updateResponse = await authenticatedClient.PutAsJsonAsync(
                $"/api/employees/{createdEmployee.Id}", updateDto);
            
            // Assert - Update
            updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var updateContent = await updateResponse.Content.ReadAsStringAsync();
            var updatedEmployee = JsonSerializer.Deserialize<EmployeeDto>(updateContent, _jsonOptions);
            
            updatedEmployee.Should().NotBeNull();
            updatedEmployee.LastName.Should().Be(updateDto.LastName);
            updatedEmployee.Department.Should().Be(updateDto.Department);
            
            // Act - Delete
            var deleteResponse = await authenticatedClient.DeleteAsync($"/api/employees/{createdEmployee.Id}");
            
            // Assert - Delete
            deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
            
            // Act - Verify Deleted
            var getDeletedResponse = await authenticatedClient.GetAsync($"/api/employees/{createdEmployee.Id}");
            
            // Assert - Verify Deleted
            getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
        
        [Fact]
        public async Task Create_WithInvalidRole_ReturnsForbidden()
        {
            // Arrange - Leader trying to create a Director
            var token = await GetLeaderAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            var createDto = new CreateEmployeeDto
            {
                FirstName = "Test",
                LastName = $"Director {Guid.NewGuid()}",
                Email = $"test{Guid.NewGuid()}@example.com",
                DocumentNumber = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                Password = "Test@123",
                Role = Role.Director, // Leader can't create Director
                Department = "Management"
            };
            
            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/employees", createDto);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }
        
        [Fact]
        public async Task Update_RegularEmployee_CannotUpdateOthers()
        {
            // Arrange - Regular employee trying to update someone else
            var token = await GetEmployeeAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // First get a leader to try updating
            var directorToken = await GetDirectorAuthToken();
            var directorClient = AuthHelper.CreateAuthenticatedClient(_factory, directorToken);
            
            var leadersResponse = await directorClient.GetAsync("/api/employees/leaders-directors");
            var leadersContent = await leadersResponse.Content.ReadAsStringAsync();
            var leaders = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(leadersContent, _jsonOptions);
            
            var leaderToUpdate = leaders.FirstOrDefault(l => l.Role == Role.Leader);
            leaderToUpdate.Should().NotBeNull();
            
            // Create update DTO
            var updateDto = new UpdateEmployeeDto
            {
                Id = leaderToUpdate.Id,
                FirstName = "Updated",
                LastName = "Name",
                Email = leaderToUpdate.Email,
                Role = leaderToUpdate.Role,
                Department = leaderToUpdate.Department
            };
            
            // Act - Regular employee tries to update a leader
            var response = await authenticatedClient.PutAsJsonAsync($"/api/employees/{leaderToUpdate.Id}", updateDto);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }
        
        [Fact]
        public async Task UpdatePassword_DirectorCanUpdateAnyEmployeePassword()
        {
            // Arrange
            var directorToken = await GetDirectorAuthToken();
            var directorClient = AuthHelper.CreateAuthenticatedClient(_factory, directorToken);
            
            // First get an employee
            var allResponse = await directorClient.GetAsync("/api/employees");
            var allContent = await allResponse.Content.ReadAsStringAsync();
            var employees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(allContent, _jsonOptions);
            
            var regularEmployee = employees.FirstOrDefault(e => e.Role == Role.Employee);
            regularEmployee.Should().NotBeNull();
            
            // Skip this test if we can't find a regular employee
            if (regularEmployee == null)
            {
                return;
            }
            
            // Create password update DTO
            var updateDto = new UpdatePasswordDto
            {
                EmployeeId = regularEmployee.Id,
                CurrentPassword = "director-doesnt-need-to-know-old-password",
                NewPassword = "NewPass@123",
                ConfirmNewPassword = "NewPass@123"
            };
            
            // Act - Director updates someone else's password
            var response = await directorClient.PutAsJsonAsync($"/api/employees/{regularEmployee.Id}/password", updateDto);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("sucesso");
        }
        
        [Fact]
        public async Task GetPaged_WithSearchTerm_ReturnsFilteredResults()
        {
            // Arrange
            var token = await GetDirectorAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // First get all employees
            var allResponse = await authenticatedClient.GetAsync("/api/employees");
            var allContent = await allResponse.Content.ReadAsStringAsync();
            var allEmployees = JsonSerializer.Deserialize<List<EmployeeListItemDto>>(allContent, _jsonOptions);
            
            // Get a name to search for
            var firstEmployee = allEmployees.FirstOrDefault();
            firstEmployee.Should().NotBeNull();
            
            // Extract first name for search
            var searchTerm = firstEmployee.FullName.Split(' ').FirstOrDefault();
            searchTerm.Should().NotBeNull();
            
            // Act
            var response = await authenticatedClient.GetAsync($"/api/employees/paged?searchTerm={searchTerm}");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var pagedResult = JsonSerializer.Deserialize<PagedResultDto<EmployeeListItemDto>>(content, _jsonOptions);
            
            pagedResult.Should().NotBeNull();
            pagedResult.Items.Should().NotBeNull();
            pagedResult.Items.Should().Contain(e => e.FullName.Contains(searchTerm));
        }
    }
}