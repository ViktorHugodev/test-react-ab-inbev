using Xunit;

namespace CompanyManager.IntegrationTests
{
    [CollectionDefinition("TestServerCollection")]
    public class TestServerCollectionFixture : ICollectionFixture<CustomWebApplicationFactory>
    {
        // This class acts as a placeholder for the collection definition.
    }
}