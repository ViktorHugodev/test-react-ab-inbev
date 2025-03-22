using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Domain.Enums;
using CompanyManager.IntegrationTests.Helpers;

namespace CompanyManager.IntegrationTests.Controllers
{
    [Collection("TestServerCollection")]
    public class DepartmentsControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public DepartmentsControllerTests(CustomWebApplicationFactory factory)
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
        
        private async Task<string> GetAuthToken()
        {
            // Login with admin credentials (Director role needed for most Department operations)
            return await AuthHelper.GetAuthTokenAsync(_client, "admin@example.com", "Admin@123");
        }
        
        [Fact]
        public async Task GetAll_WithoutAuthentication_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/departments");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
        
        [Fact]
        public async Task GetAll_WithAuthentication_ReturnsOk()
        {
            // Arrange
            var token = await GetAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // Act
            var response = await authenticatedClient.GetAsync("/api/departments");
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var departments = JsonSerializer.Deserialize<List<DepartmentDto>>(content, _jsonOptions);
            
            departments.Should().NotBeNull();
        }
        
        [Fact]
        public async Task CreateAndDelete_Department_FullLifecycle()
        {
            // Arrange
            var token = await GetAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            var createDto = new CreateDepartmentDto
            {
                Name = $"Test Department {Guid.NewGuid()}",
                Description = "Test Description for Integration Test"
            };
            
            // Act - Create
            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/departments", createDto);
            
            // Assert - Create
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdDepartment = JsonSerializer.Deserialize<DepartmentDto>(createContent, _jsonOptions);
            
            createdDepartment.Should().NotBeNull();
            createdDepartment.Name.Should().Be(createDto.Name);
            createdDepartment.Description.Should().Be(createDto.Description);
            createdDepartment.IsActive.Should().BeTrue();
            
            // Act - Get By Id
            var getResponse = await authenticatedClient.GetAsync($"/api/departments/{createdDepartment.Id}");
            
            // Assert - Get By Id
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var retrievedDepartment = JsonSerializer.Deserialize<DepartmentDto>(getContent, _jsonOptions);
            
            retrievedDepartment.Should().NotBeNull();
            retrievedDepartment.Id.Should().Be(createdDepartment.Id);
            
            // Act - Update
            var updateDto = new UpdateDepartmentDto
            {
                Id = createdDepartment.Id,
                Name = $"{createDto.Name} Updated",
                Description = $"{createDto.Description} Updated"
            };
            
            var updateResponse = await authenticatedClient.PutAsJsonAsync(
                $"/api/departments/{createdDepartment.Id}", updateDto);
            
            // Assert - Update
            updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var updateContent = await updateResponse.Content.ReadAsStringAsync();
            var updatedDepartment = JsonSerializer.Deserialize<DepartmentDto>(updateContent, _jsonOptions);
            
            updatedDepartment.Should().NotBeNull();
            updatedDepartment.Name.Should().Be(updateDto.Name);
            updatedDepartment.Description.Should().Be(updateDto.Description);
            
            // Act - Deactivate
            var deactivateResponse = await authenticatedClient.PatchAsync(
                $"/api/departments/{createdDepartment.Id}/deactivate", null);
            
            // Assert - Deactivate
            deactivateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            // Act - Get Updated Department
            var getUpdatedResponse = await authenticatedClient.GetAsync($"/api/departments/{createdDepartment.Id}");
            
            // Assert - Verify Deactivated
            getUpdatedResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var getUpdatedContent = await getUpdatedResponse.Content.ReadAsStringAsync();
            var deactivatedDepartment = JsonSerializer.Deserialize<DepartmentDto>(getUpdatedContent, _jsonOptions);
            
            deactivatedDepartment.Should().NotBeNull();
            deactivatedDepartment.IsActive.Should().BeFalse();
            
            // Act - Delete
            var deleteResponse = await authenticatedClient.DeleteAsync($"/api/departments/{createdDepartment.Id}");
            
            // Assert - Delete
            deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
            
            // Act - Verify Deleted
            var getDeletedResponse = await authenticatedClient.GetAsync($"/api/departments/{createdDepartment.Id}");
            
            // Assert - Verify Deleted
            getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
        
        [Fact]
        public async Task Create_WithDuplicateName_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            var departmentName = $"Duplicate Department {Guid.NewGuid()}";
            
            var createDto1 = new CreateDepartmentDto
            {
                Name = departmentName,
                Description = "First Department"
            };
            
            var createDto2 = new CreateDepartmentDto
            {
                Name = departmentName, // Same name
                Description = "Second Department"
            };
            
            // Act - Create First Department
            var response1 = await authenticatedClient.PostAsJsonAsync("/api/departments", createDto1);
            response1.StatusCode.Should().Be(HttpStatusCode.Created);
            
            // Act - Try to Create Second Department with Same Name
            var response2 = await authenticatedClient.PostAsJsonAsync("/api/departments", createDto2);
            
            // Assert
            response2.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response2.Content.ReadAsStringAsync();
            content.Should().Contain("existe");
            
            // Cleanup
            var createdContent = await response1.Content.ReadAsStringAsync();
            var createdDepartment = JsonSerializer.Deserialize<DepartmentDto>(createdContent, _jsonOptions);
            
            await authenticatedClient.DeleteAsync($"/api/departments/{createdDepartment.Id}");
        }
        
        [Fact]
        public async Task GetActive_ReturnsOnlyActiveDepartments()
        {
            // Arrange
            var token = await GetAuthToken();
            var authenticatedClient = AuthHelper.CreateAuthenticatedClient(_factory, token);
            
            // Create two departments (one active, one inactive)
            var activeDeptName = $"Active Dept {Guid.NewGuid()}";
            var inactiveDeptName = $"Inactive Dept {Guid.NewGuid()}";
            
            var activeDeptDto = new CreateDepartmentDto { Name = activeDeptName, Description = "Active department" };
            var inactiveDeptDto = new CreateDepartmentDto { Name = inactiveDeptName, Description = "Will be deactivated" };
            
            // Act - Create departments
            var createActiveResponse = await authenticatedClient.PostAsJsonAsync("/api/departments", activeDeptDto);
            var activeContent = await createActiveResponse.Content.ReadAsStringAsync();
            var activeDept = JsonSerializer.Deserialize<DepartmentDto>(activeContent, _jsonOptions);
            
            var createInactiveResponse = await authenticatedClient.PostAsJsonAsync("/api/departments", inactiveDeptDto);
            var inactiveContent = await createInactiveResponse.Content.ReadAsStringAsync();
            var inactiveDept = JsonSerializer.Deserialize<DepartmentDto>(inactiveContent, _jsonOptions);
            
            // Deactivate one department
            await authenticatedClient.PatchAsync($"/api/departments/{inactiveDept.Id}/deactivate", null);
            
            // Act - Get active departments
            var getActiveResponse = await authenticatedClient.GetAsync("/api/departments/active");
            
            // Assert
            getActiveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var activeDepartmentsContent = await getActiveResponse.Content.ReadAsStringAsync();
            var activeDepartments = JsonSerializer.Deserialize<List<DepartmentDto>>(activeDepartmentsContent, _jsonOptions);
            
            activeDepartments.Should().NotBeNull();
            activeDepartments.Should().Contain(d => d.Id == activeDept.Id);
            activeDepartments.Should().NotContain(d => d.Id == inactiveDept.Id);
            
            // Cleanup
            await authenticatedClient.DeleteAsync($"/api/departments/{activeDept.Id}");
            await authenticatedClient.DeleteAsync($"/api/departments/{inactiveDept.Id}");
        }
        
        [Fact]
        public async Task NonDirector_CannotCreateDepartment()
        {
            // Arrange - Login with regular user (not Director)
            var regularUserToken = await AuthHelper.GetAuthTokenAsync(_client, "user@example.com", "User@123");
            var regularUserClient = AuthHelper.CreateAuthenticatedClient(_factory, regularUserToken);
            
            var createDto = new CreateDepartmentDto
            {
                Name = $"Regular User Dept {Guid.NewGuid()}",
                Description = "This should fail"
            };
            
            // Act
            var response = await regularUserClient.PostAsJsonAsync("/api/departments", createDto);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }
    }
}