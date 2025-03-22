using System;
using CompanyManager.API;
using CompanyManager.Infrastructure.Data;
using DotNet.Testcontainers.Builders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Testcontainers.MsSql;

namespace CompanyManager.IntegrationTests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        private readonly MsSqlContainer _msSqlContainer;

        public CustomWebApplicationFactory()
        {
            _msSqlContainer = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .WithPassword("Strong_password_123!")
                .WithEnvironment("ACCEPT_EULA", "Y")
                .WithPortBinding(1433, true)
                .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(1433))
                .Build();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Find and remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add the test database
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    // Use SQL Server provider with test container connection string
                    options.UseSqlServer(_msSqlContainer.GetConnectionString());
                });

                // Create and migrate the database
                var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<CustomWebApplicationFactory>>();
                
                try
                {
                    // Ensure database is created
                    db.Database.EnsureCreated();
                    try 
                    {
                        db.Database.Migrate();
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Migration failed, but database was created");
                        // Continue anyway - we'll ensure tables are created by TestDataSeeder
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while setting up the test database. {Message}", ex.Message);
                    throw;
                }
            });
        }

        public async Task InitializeAsync()
        {
            await _msSqlContainer.StartAsync();
        }

        public new async Task DisposeAsync()
        {
            await _msSqlContainer.DisposeAsync();
        }
    }
}