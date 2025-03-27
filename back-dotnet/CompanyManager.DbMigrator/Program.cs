using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CompanyManager.DbMigrator
{
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
                services.AddDbContext<CompanyManager.Infrastructure.Data.ApplicationDbContext>(options =>
                    options.UseSqlServer("Server=localhost;Database=CompanyManager;User Id=sa;Password=StrongPassword123!;TrustServerCertificate=True;"));

                // Criar um ServiceProvider
                var serviceProvider = services.BuildServiceProvider();

                // Obter o DbContext
                using var dbContext = serviceProvider.GetRequiredService<CompanyManager.Infrastructure.Data.ApplicationDbContext>();

                // Criar a tabela Employees com PhoneNumbersJson
                var createEmployeesTableSql = @"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
                    BEGIN
                        CREATE TABLE [Employees] (
                            [Id] uniqueidentifier NOT NULL,
                            [FirstName] nvarchar(50) NOT NULL,
                            [LastName] nvarchar(50) NOT NULL,
                            [Email] nvarchar(100) NOT NULL,
                            [DocumentNumber] nvarchar(20) NOT NULL,
                            [BirthDate] datetime2 NOT NULL,
                            [PasswordHash] nvarchar(100) NOT NULL,
                            [Role] int NOT NULL,
                            [Department] nvarchar(50) NOT NULL,
                            [ManagerId] uniqueidentifier NULL,
                            [CreatedAt] datetime2 NOT NULL,
                            [UpdatedAt] datetime2 NULL,
                            [PhoneNumbersJson] nvarchar(max) NOT NULL DEFAULT '[]',
                            CONSTRAINT [PK_Employees] PRIMARY KEY ([Id])
                        );
                        
                        ALTER TABLE [Employees] 
                        ADD CONSTRAINT [FK_Employees_Employees_ManagerId] 
                        FOREIGN KEY ([ManagerId]) REFERENCES [Employees] ([Id]);
                        
                        CREATE UNIQUE INDEX [IX_Employees_Email] ON [Employees] ([Email]);
                        CREATE UNIQUE INDEX [IX_Employees_DocumentNumber] ON [Employees] ([DocumentNumber]);
                        CREATE INDEX [IX_Employees_ManagerId] ON [Employees] ([ManagerId]);
                        
                        PRINT 'Table Employees created successfully!';
                    END
                    ELSE
                    BEGIN
                        -- Se a tabela já existe, verifica se precisa adicionar a coluna PhoneNumbersJson
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'PhoneNumbersJson' AND object_id = OBJECT_ID('Employees'))
                        BEGIN
                            ALTER TABLE [Employees] ADD [PhoneNumbersJson] nvarchar(max) NOT NULL DEFAULT '[]';
                            PRINT 'Added PhoneNumbersJson column to Employees table';
                        END
                        ELSE
                        BEGIN
                            PRINT 'PhoneNumbersJson column already exists in Employees table';
                        END
                    END
                ";

                // Usar comando SQL direto para criar a tabela Departments
                var departmentsSql = @"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
                    BEGIN
                        CREATE TABLE [Departments] (
                            [Id] uniqueidentifier NOT NULL,
                            [Name] nvarchar(50) NOT NULL,
                            [Description] nvarchar(200) NULL,
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

                // Executar as instruções SQL
                Console.WriteLine("Creating/Updating Employees table...");
                await dbContext.Database.ExecuteSqlRawAsync(createEmployeesTableSql);
                
                Console.WriteLine("Creating/Updating Departments table...");
                await dbContext.Database.ExecuteSqlRawAsync(departmentsSql);
                
                Console.WriteLine("Verificando se a base de dados existe e está acessível...");
                bool canConnect = await dbContext.Database.CanConnectAsync();
                Console.WriteLine($"Conexão com banco de dados: {(canConnect ? "Sucesso" : "Falha")}");
                
                if (canConnect)
                {
                    Console.WriteLine("Criando banco de dados se não existir...");
                    await dbContext.Database.EnsureCreatedAsync();
                }
                
                // Verificar se a tabela PhoneNumbers existe e, se existir, migrar os dados para o formato JSON
                var migratePhoneNumbersDataSql = @"
                    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'PhoneNumbers')
                    BEGIN
                        -- Para cada funcionário, atualizar PhoneNumbersJson com seus telefones
                        DECLARE @EmployeeId UNIQUEIDENTIFIER
                        DECLARE employee_cursor CURSOR FOR 
                        SELECT Id FROM Employees
                        
                        OPEN employee_cursor
                        FETCH NEXT FROM employee_cursor INTO @EmployeeId
                        
                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            DECLARE @PhoneJson NVARCHAR(MAX)
                            
                            -- Construa o JSON com os telefones deste funcionário
                            SELECT @PhoneJson = (
                                SELECT 
                                    Id as ""Id"", 
                                    Number as ""Number"", 
                                    Type as ""Type""
                                FROM PhoneNumbers 
                                WHERE EmployeeId = @EmployeeId
                                FOR JSON PATH
                            )
                            
                            -- Se não tiver telefones, use array vazio
                            IF @PhoneJson IS NULL
                                SET @PhoneJson = '[]'
                            
                            -- Atualize o funcionário com o JSON de telefones
                            UPDATE Employees
                            SET PhoneNumbersJson = @PhoneJson
                            WHERE Id = @EmployeeId
                            
                            FETCH NEXT FROM employee_cursor INTO @EmployeeId
                        END
                        
                        CLOSE employee_cursor
                        DEALLOCATE employee_cursor
                        
                        -- Após migrar todos os dados, excluir a tabela antiga
                        DROP TABLE PhoneNumbers;
                        PRINT 'PhoneNumbers data migrated to Employees.PhoneNumbersJson and the table dropped.';
                    END
                    ELSE
                    BEGIN
                        PRINT 'Table PhoneNumbers does not exist, no migration needed.';
                    END
                ";
                
                Console.WriteLine("Migrating PhoneNumbers data if needed...");
                await dbContext.Database.ExecuteSqlRawAsync(migratePhoneNumbersDataSql);
                
                Console.WriteLine("All SQL commands executed successfully!");
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
}