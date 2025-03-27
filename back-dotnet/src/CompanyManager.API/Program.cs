using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using CompanyManager.API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using CompanyManager.Application.Interfaces;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Infrastructure.Data;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.ValueObjects;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Adiciona serviços ao container
builder.Services.AddControllers();

// Configuração do DataProtection
var keysDirectory = Path.Combine(builder.Environment.ContentRootPath, "keys");
Directory.CreateDirectory(keysDirectory);

// Configurar o DataProtection para persistir chaves em um diretório específico
var dataProtectionBuilder = builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysDirectory))
    .SetApplicationName("CompanyManager")
    .SetDefaultKeyLifetime(TimeSpan.FromDays(14));

// Configurar a proteção das chaves com certificado
var certPath = Path.Combine(builder.Environment.ContentRootPath, "certs", "cert.pfx");
if (File.Exists(certPath))
{
  try
  {
    var certificate = new X509Certificate2(certPath, "CompanyManager123");
    dataProtectionBuilder.ProtectKeysWithCertificate(certificate);
    Log.Information("Proteção de chaves configurada com certificado X.509");
  }
  catch (Exception ex)
  {
    Log.Warning(ex, "Não foi possível carregar o certificado para proteção de chaves. As chaves serão armazenadas sem criptografia.");
  }
}
else
{
  Log.Warning("Certificado para proteção de chaves não encontrado em {CertPath}. As chaves serão armazenadas sem criptografia.", certPath);
}

// 3. Configuração do Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Se DB_PASSWORD estiver no ambiente, substituir no connection string
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
if (!string.IsNullOrEmpty(dbPassword))
{
  connectionString = connectionString.Replace("StrongPass123", dbPassword);
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
  options.UseSqlServer(connectionString);
});

// 4. Configuração de CORS
builder.Services.AddCors(options =>
{
  options.AddPolicy("CorsPolicy", policy =>
  {
    policy.WithOrigins("http://localhost:3000", "http://localhost:5000", "http://frontend:3000", "http://company-manager-frontend:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    // Remova .AllowCredentials() ou especifique origens específicas
  });
});

// 5. Lê configurações de JWT do appsettings.json
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

// 6. Pega a Secret do ambiente ou do config
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings["Secret"];

// Verifica se está vazio ou nulo
if (string.IsNullOrWhiteSpace(jwtSecret))
{
  throw new Exception("JWT_SECRET não foi definido no ambiente ou JwtSettings:Secret no appsettings.json.");
}

// Converte para bytes
var key = Encoding.UTF8.GetBytes(jwtSecret);

// 7. Configuração de autenticação JWT
builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.RequireHttpsMetadata = false;
  options.SaveToken = true;
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(key),
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidIssuer = jwtSettings["Issuer"],
    ValidAudience = jwtSettings["Audience"],
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero
  };
});

// 8. Registro dos serviços da aplicação
builder.Services.AddScoped<IUnitOfWork, CompanyManager.Infrastructure.UnitOfWork.UnitOfWork>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// 9. Configuração do Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
  c.SwaggerDoc("v1", new OpenApiInfo
  {
    Title = "Company Manager API",
    Version = "v1",
    Description = "API para gerenciamento de funcionários"
  });

  // Definição de Autenticação via JWT no Swagger
  c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    Description = "JWT Authorization header usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
    Name = "Authorization",
    In = ParameterLocation.Header,
    Type = SecuritySchemeType.ApiKey,
    Scheme = "Bearer"
  });

  c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 10. Middleware de tratamento de exceções
app.UseMiddleware<ExceptionHandlerMiddleware>();

// 11. Pipeline de requisições HTTP
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 12. Seed do banco de dados (opcional, p/ Dev)
if (app.Environment.IsDevelopment())
{
  using var scope = app.Services.CreateScope();
  var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
  var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

  try
  {
    // Garante que o banco de dados exista e esteja acessível
    Log.Information("Garantindo que o banco de dados existe...");
    await dbContext.Database.EnsureCreatedAsync();

    // Executa o script SQL customizado para criar as tabelas se necessário
    var createTablesScript = @"
            -- Criar a tabela de Employees se não existir
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
                    [PhoneNumbersJson] nvarchar(max) NOT NULL DEFAULT '[]',
                    [Role] int NOT NULL,
                    [Department] nvarchar(50) NOT NULL,
                    [ManagerId] uniqueidentifier NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NULL,
                    CONSTRAINT [PK_Employees] PRIMARY KEY ([Id])
                );
                
                CREATE UNIQUE INDEX [IX_Employees_Email] ON [Employees] ([Email]);
                CREATE UNIQUE INDEX [IX_Employees_DocumentNumber] ON [Employees] ([DocumentNumber]);
                
                PRINT 'Tabela Employees criada com sucesso!';
            END
            ELSE
            BEGIN
                PRINT 'Tabela Employees já existe.';
                
                -- Verifica se a coluna PhoneNumbersJson existe
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'PhoneNumbersJson' AND object_id = OBJECT_ID('Employees'))
                BEGIN
                    ALTER TABLE [Employees] ADD [PhoneNumbersJson] nvarchar(max) NOT NULL DEFAULT '[]';
                    PRINT 'Coluna PhoneNumbersJson adicionada à tabela Employees';
                END
            END;
            
            -- Criar a tabela de Departments se não existir
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
                
                PRINT 'Tabela Departments criada com sucesso!';
            END;
            
            -- Adicionar relação de gerência se necessário
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
                AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Employees_Employees_ManagerId')
            BEGIN
                ALTER TABLE [Employees] 
                ADD CONSTRAINT [FK_Employees_Employees_ManagerId] 
                FOREIGN KEY ([ManagerId]) REFERENCES [Employees] ([Id]);
                
                CREATE INDEX [IX_Employees_ManagerId] ON [Employees] ([ManagerId]);
                
                PRINT 'Relação de gerência adicionada à tabela Employees';
            END;
        ";

    Log.Information("Executando script para criar/atualizar tabelas...");
    await dbContext.Database.ExecuteSqlRawAsync(createTablesScript);

    // Verificar se já existem registros
    Log.Information("Verificando se é necessário fazer seed de dados...");
    var employeesExist = await dbContext.Employees.AnyAsync();
    var departmentsExist = await dbContext.Departments.AnyAsync();

    if (!departmentsExist)
    {
      Log.Information("Criando departamentos...");
      var departments = new List<Department>
            {
                Department.Create("Tecnologia", "Departamento de Tecnologia da Informação"),
                Department.Create("RH", "Recursos Humanos"),
                Department.Create("Financeiro", "Departamento Financeiro"),
                Department.Create("Marketing", "Departamento de Marketing")
            };

      await dbContext.Departments.AddRangeAsync(departments);
      await dbContext.SaveChangesAsync();
      Log.Information("Departamentos criados com sucesso!");
    }

    if (!employeesExist)
    {
      Log.Information("Criando funcionários...");

      // Diretor
      var director = Employee.Create(
          "Admin",
          "Sistema",
          "admin@companymanager.com",
          "123.456.789-00",
          new DateTime(1980, 1, 1),
          authService.HashPassword("Admin@123"),
          Role.Director,
          "Tecnologia",
          null);

      director.AddPhoneNumber("11987654321", PhoneType.Mobile);
      director.AddPhoneNumber("1133334444", PhoneType.Work);

      await dbContext.Employees.AddAsync(director);
      await dbContext.SaveChangesAsync();


      // Líderes
      var leader1 = Employee.Create(
          "Maria",
          "Santos",
          "maria.santos@empresa.com",
          "987.654.321-00",
          new DateTime(1985, 5, 15),
          authService.HashPassword("Senha@123"),
          Role.Leader,
          "RH",
          director.Id);

      leader1.AddPhoneNumber("11976543210", PhoneType.Mobile);

      var leader2 = Employee.Create(
          "Carlos",
          "Ferreira",
          "carlos.ferreira@empresa.com",
          "111.222.333-44",
          new DateTime(1982, 8, 20),
          authService.HashPassword("Senha@123"),
          Role.Leader,
          "Financeiro",
          director.Id);

      leader2.AddPhoneNumber("11955556666", PhoneType.Mobile);

      await dbContext.Employees.AddRangeAsync(new[] { leader1, leader2 });
      await dbContext.SaveChangesAsync();

      // Funcionários regulares
      var employee1 = Employee.Create(
          "Ana",
          "Oliveira",
          "ana.oliveira@empresa.com",
          "222.333.444-55",
          new DateTime(1990, 3, 10),
          authService.HashPassword("Senha@123"),
          Role.Employee,
          "RH",
          leader1.Id);

      employee1.AddPhoneNumber("11944445555", PhoneType.Mobile);

      var employee2 = Employee.Create(
          "Pedro",
          "Costa",
          "pedro.costa@empresa.com",
          "333.444.555-66",
          new DateTime(1992, 7, 25),
          authService.HashPassword("Senha@123"),
          Role.Employee,
          "Financeiro",
          leader2.Id);

      employee2.AddPhoneNumber("11933334444", PhoneType.Mobile);

      await dbContext.Employees.AddRangeAsync(new[] { employee1, employee2 });
      await dbContext.SaveChangesAsync();

      Log.Information("Funcionários criados com sucesso!");
    }

    Log.Information("Inicialização do banco de dados concluída com sucesso!");
  }
  catch (Exception ex)
  {
    Log.Error(ex, "Ocorreu um erro durante a inicialização do banco de dados.");
  }
}

// Log que a aplicação está executando com endereço/porta
Log.Information("Aplicação iniciada. API disponível em: http://localhost:5000");
app.Run();

// Torna a classe Program pública para testes
public partial class Program { }