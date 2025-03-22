using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;

namespace CompanyManager.IntegrationTests.Helpers
{
    public static class AuthHelper
    {
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public static async Task<string> GetAuthTokenAsync(HttpClient client, string email, string password)
        {
            var loginDto = new LoginDto
            {
                Email = email,
                Password = password
            };

            var response = await client.PostAsJsonAsync("/api/auth/login", loginDto);
            
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            var authResponse = JsonSerializer.Deserialize<AuthResponseDto>(content, _jsonOptions);
            
            return authResponse?.Token;
        }

        public static HttpClient CreateAuthenticatedClient(CustomWebApplicationFactory factory, string token)
        {
            var client = factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }
    }
}