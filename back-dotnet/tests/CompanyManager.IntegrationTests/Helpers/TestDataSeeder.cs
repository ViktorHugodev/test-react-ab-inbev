using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CompanyManager.IntegrationTests.Helpers
{
    public static class TestDataSeeder
    {
        public static async Task SeedTestUsersAsync(CustomWebApplicationFactory factory)
        {
            using var scope = factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            try
            {
                // Ensure database and tables exist
                await dbContext.Database.EnsureCreatedAsync();
                
                // Create tables if they don't exist yet
                await EnsureTablesCreatedAsync(dbContext);
                
                // Clear existing test data
                try 
                {
                    dbContext.Employees.RemoveRange(await dbContext.Employees.ToListAsync());
                    dbContext.Departments.RemoveRange(await dbContext.Departments.ToListAsync());
                    await dbContext.SaveChangesAsync();
                }
                catch (Exception)
                {
                    // Tables might not exist yet, that's fine
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting up database: {ex.Message}");
                // We'll attempt to continue anyway
            }

            // Add test admin user
            var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            var adminUser = new Employee(
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                documentNumber: "12345678900",
                birthDate: new DateTime(1980, 1, 1),
                role: Role.Director,
                department: "Administration",
                managerId: null
            );
            adminUser.SetPasswordHash(adminPasswordHash);

            // Add test regular user
            var userPasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123");
            var regularUser = new Employee(
                firstName: "Regular",
                lastName: "User",
                email: "user@example.com",
                documentNumber: "98765432100",
                birthDate: new DateTime(1990, 1, 1),
                role: Role.Leader,
                department: "IT",
                managerId: null
            );
            regularUser.SetPasswordHash(userPasswordHash);

            // Add users to database
            await dbContext.Employees.AddRangeAsync(adminUser, regularUser);
            await dbContext.SaveChangesAsync();
        }
        
        private static async Task EnsureTablesCreatedAsync(ApplicationDbContext dbContext)
        {
            // Create tables manually if migrations fail
            try
            {
                await dbContext.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees') 
                    BEGIN
                        CREATE TABLE [Employees] (
                            [Id] uniqueidentifier NOT NULL,
                            [FirstName] nvarchar(100) NOT NULL,
                            [LastName] nvarchar(100) NOT NULL,
                            [Email] nvarchar(100) NOT NULL,
                            [DocumentNumber] nvarchar(20) NOT NULL,
                            [BirthDate] datetime2 NOT NULL,
                            [PasswordHash] nvarchar(100) NOT NULL,
                            [Role] int NOT NULL,
                            [Department] nvarchar(100) NOT NULL, 
                            [ManagerId] uniqueidentifier NULL,
                            [CreatedAt] datetime2 NOT NULL,
                            [UpdatedAt] datetime2 NULL,
                            CONSTRAINT [PK_Employees] PRIMARY KEY ([Id])
                        );
                    END
                ");
                
                await dbContext.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments') 
                    BEGIN
                        CREATE TABLE [Departments] (
                            [Id] uniqueidentifier NOT NULL,
                            [Name] nvarchar(50) NOT NULL,
                            [Description] nvarchar(200) NOT NULL,
                            [IsActive] bit NOT NULL,
                            [CreatedAt] datetime2 NOT NULL,
                            [UpdatedAt] datetime2 NULL,
                            CONSTRAINT [PK_Departments] PRIMARY KEY ([Id])
                        );
                    END
                ");
                
                await dbContext.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhoneNumbers') 
                    BEGIN
                        CREATE TABLE [PhoneNumbers] (
                            [Id] uniqueidentifier NOT NULL,
                            [Number] nvarchar(20) NOT NULL,
                            [Type] int NOT NULL,
                            [EmployeeId] uniqueidentifier NOT NULL,
                            CONSTRAINT [PK_PhoneNumbers] PRIMARY KEY ([Id]),
                            CONSTRAINT [FK_PhoneNumbers_Employees] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees]([Id]) ON DELETE CASCADE
                        );
                    END
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating tables: {ex.Message}");
                // Continue anyway - we'll try to use what we have
            }
        }
    }
}