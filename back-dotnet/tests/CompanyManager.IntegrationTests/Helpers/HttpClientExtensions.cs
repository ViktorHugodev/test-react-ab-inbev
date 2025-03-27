using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace CompanyManager.IntegrationTests.Helpers
{
    public static class HttpClientExtensions
    {
        public static Task<HttpResponseMessage> PatchAsJsonAsync<T>(
            this HttpClient client, string requestUri, T value)
        {
            return client.PatchAsync(
                requestUri, 
                JsonContent.Create(value));
        }
    }
}