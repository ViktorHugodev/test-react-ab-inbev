using System;
using System.Text;
using CompanyManager.API.Middlewares;
using CompanyManager.Application.Interfaces;
using CompanyManager.Application.Services;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Adiciona serviços ao container
builder.Services.AddControllers();

// Configuração do Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// Configuração de CORS
// Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5000")
            .AllowAnyMethod()
            .AllowAnyHeader();
        // Remova o .AllowCredentials() OU especifique origens específicas em vez de usar "*"
    });
});
// Configuração do JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

var secret = jwtSettings["Secret"];
var key = Encoding.ASCII.GetBytes(secret);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
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

// Registro dos serviços
builder.Services.AddScoped<IUnitOfWork, CompanyManager.Infrastructure.UnitOfWork.UnitOfWork>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Company Manager API",
        Version = "v1",
        Description = "API para gerenciamento de funcionários"
    });

    // Configuração para autenticação via JWT no Swagger
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

// Middleware de tratamento de exceções
app.UseMiddleware<ExceptionHandlerMiddleware>();

// Configuração do pipeline de requisições HTTP
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

// Seed do banco de dados (opcional, para ambiente de desenvolvimento)
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

// Classe para seed inicial de dados
public static class SeedData
{
    public static void Initialize(ApplicationDbContext context, IAuthService authService)
    {
        if (context.Employees.Any())
            return; // Banco já possui dados

        var director = CompanyManager.Domain.Aggregates.Employee.Employee.Create(
            "Admin",
            "Sistema",
            "admin@companymanager.com",
            "00000000000",
            new DateTime(1980, 1, 1),
            authService.HashPassword("Admin@123"),
            CompanyManager.Domain.Enums.Role.Director,
            "Diretoria");

        context.Employees.Add(director);
        context.SaveChanges();
    }
}