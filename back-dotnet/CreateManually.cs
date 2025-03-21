using System;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

class Program
{
    static async Task Main(string[] args)
    {
        try
        {
            // Configurar o serviço do DbContext
            var services = new ServiceCollection();
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer("Server=localhost;Database=CompanyManager;User Id=sa;Password=StrongPassword123!;");
            });

            // Criar um ServiceProvider
            var serviceProvider = services.BuildServiceProvider();

            // Obter o DbContext
            using var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // Verificar se já existe a tabela no modelo
            if (!await dbContext.Departments.AnyAsync())
            {
                // Adicionar alguns departamentos
                var departments = new[]
                {
                    Department.Create("Diretoria", "Departamento de Diretoria"),
                    Department.Create("RH", "Recursos Humanos"),
                    Department.Create("TI", "Tecnologia da Informação"),
                    Department.Create("Marketing", "Departamento de Marketing"),
                    Department.Create("Financeiro", "Departamento Financeiro")
                };

                // Adicionar os departamentos ao contexto
                await dbContext.Departments.AddRangeAsync(departments);

                // Salvar as alterações
                await dbContext.SaveChangesAsync();

                Console.WriteLine("Departments created successfully!");
            }
            else
            {
                Console.WriteLine("Departments already exist, no need to create them.");
            }
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