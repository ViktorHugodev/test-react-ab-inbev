using System;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

// Esta classe tem como objetivo alterar o banco de dados manualmente
// sem usar migrações do Entity Framework
class Program
{
    static async Task Main(string[] args)
    {
        try
        {
            // Configurar o serviço do DbContext
            var services = new ServiceCollection();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer("Server=localhost;Database=CompanyManager;User Id=sa;Password=StrongPassword123!;"));

            // Criar um ServiceProvider
            var serviceProvider = services.BuildServiceProvider();

            // Obter o DbContext
            using var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // Usar comando SQL direto para criar a tabela Departments
            var sql = @"
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
                    
                    CREATE UNIQUE INDEX [IX_Departments_Name] ON [Departments] ([Name]);
                    
                    PRINT 'Table Departments created successfully!';
                END
                ELSE
                BEGIN
                    PRINT 'Table Departments already exists.';
                END
            ";

            await dbContext.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("SQL command executed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Error: {ex.InnerException.Message}");
            }
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }
}