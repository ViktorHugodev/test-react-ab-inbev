using System;
using System.Text;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using CompanyManager.API.Middlewares;
using CompanyManager.Application.Interfaces;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
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
        dbContext.Database.EnsureCreated();
        dbContext.Database.Migrate();
        SeedData.Initialize(dbContext, authService);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Ocorreu um erro durante a migração ou seed do banco de dados.");
    }
}

app.Run();

// Torna a classe Program pública para testes
public partial class Program { }

// 13. Classe para seed inicial de dados
public static class SeedData
{
    public static void Initialize(ApplicationDbContext context, IAuthService authService)
    {
        // Certifique-se de que a tabela Departments existe
        context.Database.ExecuteSqlRaw(@"
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
            END
        ");
        
        // Limpa todos os dados existentes para garantir o seed completo
        try 
        {
            // Verificar se o banco já tem dados
            if (context.Employees.Any())
            {
                Console.WriteLine("Banco de dados já possui dados. Pulando seed...");
                // Se já tem dados, não faz seed novamente
                return;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao verificar dados: {ex.Message}");
        }

        // Adicionar departamentos
        var initialDepartments = new[]
        {
            CompanyManager.Domain.Aggregates.Department.Department.Create("Diretoria", "Departamento de Diretoria"),
            CompanyManager.Domain.Aggregates.Department.Department.Create("RH", "Recursos Humanos"),
            CompanyManager.Domain.Aggregates.Department.Department.Create("TI", "Tecnologia da Informação"),
            CompanyManager.Domain.Aggregates.Department.Department.Create("Marketing", "Departamento de Marketing")
        };
        
        context.Departments.AddRange(initialDepartments);
        context.SaveChanges();
        
        // Criar usuário admin
        var admin = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "Admin",
            "Sistema",
            "admin@companymanager.com",
            "00000000000",
            new DateTime(1980, 1, 1),
            authService.HashPassword("Admin@123"),
            CompanyManager.Domain.Enums.Role.Director,
            "Diretoria"
        );
        
        context.Employees.Add(admin);
        context.SaveChanges();
        
        // Adicionar líderes para cada departamento
        var leaders = new List<CompanyManager.Domain.Aggregates.Employee.Employee>();
        
        var leaderTI = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "João",
            "Silva",
            "joao.silva@companymanager.com",
            "11111111111",
            new DateTime(1985, 5, 15),
            authService.HashPassword("Leader@123"),
            CompanyManager.Domain.Enums.Role.Leader,
            "TI"
        );
        
        var leaderRH = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "Maria",
            "Santos",
            "maria.santos@companymanager.com",
            "22222222222",
            new DateTime(1982, 7, 20),
            authService.HashPassword("Leader@123"),
            CompanyManager.Domain.Enums.Role.Leader,
            "RH"
        );
        
        var leaderMarketing = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "Pedro",
            "Oliveira", 
            "pedro.oliveira@companymanager.com",
            "33333333333",
            new DateTime(1988, 3, 10),
            authService.HashPassword("Leader@123"),
            CompanyManager.Domain.Enums.Role.Leader,
            "Marketing"
        );
        
        var leaderDiretoria = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "Ana",
            "Pereira",
            "ana.pereira@companymanager.com", 
            "44444444444",
            new DateTime(1975, 9, 5),
            authService.HashPassword("Leader@123"),
            CompanyManager.Domain.Enums.Role.Leader,
            "Diretoria"
        );
        
        leaders.AddRange(new[] { leaderTI, leaderRH, leaderMarketing, leaderDiretoria });
        context.Employees.AddRange(leaders);
        context.SaveChanges();
        
        // Adicionar funcionários regulares
        var employees = new List<CompanyManager.Domain.Aggregates.Employee.Employee>
        {
            // TI
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Lucas", "Ferreira", "lucas.ferreira@companymanager.com", "55555555555", 
                new DateTime(1990, 6, 12), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "TI", leaderTI.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Juliana", "Costa", "juliana.costa@companymanager.com", "66666666666", 
                new DateTime(1993, 2, 25), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "TI", leaderTI.Id),
                
            // RH
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Roberto", "Almeida", "roberto.almeida@companymanager.com", "77777777777", 
                new DateTime(1987, 11, 8), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "RH", leaderRH.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Carla", "Vieira", "carla.vieira@companymanager.com", "88888888888", 
                new DateTime(1991, 4, 17), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "RH", leaderRH.Id),
                
            // Marketing
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Felipe", "Souza", "felipe.souza@companymanager.com", "99999999999", 
                new DateTime(1989, 8, 30), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Marketing", leaderMarketing.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Beatriz", "Lima", "beatriz.lima@companymanager.com", "10101010101", 
                new DateTime(1992, 1, 22), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Marketing", leaderMarketing.Id),
                
            // Diretoria
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Ricardo", "Machado", "ricardo.machado@companymanager.com", "12121212121", 
                new DateTime(1984, 10, 15), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Diretoria", leaderDiretoria.Id),
                
            // Novos funcionários adicionais com 2 telefones cada
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Amanda", "Santos", "amanda.santos@companymanager.com", "13131313131", 
                new DateTime(1988, 3, 14), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "TI", leaderTI.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Bruno", "Oliveira", "bruno.oliveira@companymanager.com", "14141414141", 
                new DateTime(1991, 8, 27), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "RH", leaderRH.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Carolina", "Pereira", "carolina.pereira@companymanager.com", "15151515151", 
                new DateTime(1986, 5, 19), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Marketing", leaderMarketing.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Daniel", "Martins", "daniel.martins@companymanager.com", "16161616161", 
                new DateTime(1990, 11, 3), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "TI", leaderTI.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Eduarda", "Ribeiro", "eduarda.ribeiro@companymanager.com", "17171717171", 
                new DateTime(1992, 7, 8), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "RH", leaderRH.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Fábio", "Almeida", "fabio.almeida@companymanager.com", "18181818181", 
                new DateTime(1989, 2, 12), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Diretoria", leaderDiretoria.Id),
                
            // Mais 5 funcionários adicionais com 2 telefones cada
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Gabriela", "Moreira", "gabriela.moreira@companymanager.com", "19191919191", 
                new DateTime(1993, 9, 21), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Marketing", leaderMarketing.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Henrique", "Gomes", "henrique.gomes@companymanager.com", "20202020202", 
                new DateTime(1985, 12, 5), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "TI", leaderTI.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Isabela", "Cardoso", "isabela.cardoso@companymanager.com", "21212121212", 
                new DateTime(1990, 4, 28), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "RH", leaderRH.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "João Paulo", "Mendes", "joao.mendes@companymanager.com", "29292929292", 
                new DateTime(1987, 6, 17), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Diretoria", leaderDiretoria.Id),
                
            CompanyManager.Domain.Aggregates.Employee.Employee.Create(
                "Karina", "Fernandes", "karina.fernandes@companymanager.com", "23232323232", 
                new DateTime(1994, 2, 9), authService.HashPassword("Employee@123"),
                CompanyManager.Domain.Enums.Role.Employee, "Marketing", leaderMarketing.Id)
        };
        
        // Adicionar funcionários ao contexto
        context.Employees.AddRange(employees);
        context.SaveChanges();
        
        // Adicionar telefones para os funcionários
        foreach (var employee in employees)
        {
            // Adicionar 2 telefones para cada funcionário
            employee.AddPhoneNumber("119" + employee.DocumentNumber.Substring(0, 8), CompanyManager.Domain.ValueObjects.PhoneType.Mobile);
            employee.AddPhoneNumber("113" + employee.DocumentNumber.Substring(0, 8), CompanyManager.Domain.ValueObjects.PhoneType.Home);
        }
        
        // Atualizar os funcionários com os telefones
        context.SaveChanges();
    }
}
