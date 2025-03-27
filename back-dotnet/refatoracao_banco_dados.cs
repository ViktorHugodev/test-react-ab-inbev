using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

// =========================== MODELOS DE ENTIDADE ATUALIZADOS ===========================

// 1. Entidade Employee atualizada
namespace CompanyManager.Domain.Aggregates.Employee
{
    public class Employee : IHasTimestamps
    {
        // Propriedades existentes mantidas
        public Guid Id { get; private set; }
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string Email { get; private set; }
        public string DocumentNumber { get; private set; }
        public DateTime BirthDate { get; private set; }
        public string PasswordHash { get; private set; }
        public Role Role { get; private set; }
        public string Department { get; private set; }
        public Guid? ManagerId { get; private set; }
        public Employee Manager { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        
        // Nova propriedade para armazenar os números de telefone como JSON
        public string PhoneNumbersJson { get; private set; } = "[]";
        
        // Propriedade calculada (não mapeada) para acesso aos números de telefone
        [NotMapped]
        public IReadOnlyCollection<PhoneNumberDto> PhoneNumbers
        {
            get
            {
                if (string.IsNullOrEmpty(PhoneNumbersJson))
                    return new List<PhoneNumberDto>().AsReadOnly();
                    
                return JsonSerializer.Deserialize<List<PhoneNumberDto>>(PhoneNumbersJson)?.AsReadOnly() 
                    ?? new List<PhoneNumberDto>().AsReadOnly();
            }
        }

        // Propriedade de navegação para funcionários subordinados
        public ICollection<Employee> Subordinates { get; private set; } = new List<Employee>();

        // Construtor privado para EF Core
        private Employee() { }
        
        // Factory method principal (mantido similar ao original)
        public static Employee Create(
            string firstName,
            string lastName,
            string email,
            string documentNumber,
            DateTime birthDate,
            string password,
            Role role,
            string department,
            Guid? managerId = null)
        {
            ValidateName(firstName, lastName);
            ValidateEmail(email);
            ValidateDocumentNumber(documentNumber);
            ValidateAge(birthDate);

            return new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                Email = email.ToLower(),
                DocumentNumber = documentNumber,
                BirthDate = birthDate,
                PasswordHash = password,
                Role = role,
                Department = department,
                ManagerId = managerId,
                PhoneNumbersJson = "[]",
                CreatedAt = DateTime.UtcNow
            };
        }

        // Método para adicionar número de telefone (atualizado)
        public void AddPhoneNumber(string number, PhoneType type)
        {
            // Validação do número de telefone
            if (string.IsNullOrWhiteSpace(number))
                throw new DomainException("O número de telefone é obrigatório.");

            var normalizedNumber = NormalizePhoneNumber(number);
            if (normalizedNumber.Length < 8 || !Regex.IsMatch(normalizedNumber, @"^\d+$"))
                throw new DomainException("O número de telefone informado não é válido.");

            // Obter a lista atual de telefones
            var phoneNumbers = JsonSerializer.Deserialize<List<PhoneNumberDto>>(PhoneNumbersJson) 
                ?? new List<PhoneNumberDto>();

            // Adicionar novo telefone
            phoneNumbers.Add(new PhoneNumberDto
            {
                Id = Guid.NewGuid(),
                Number = normalizedNumber,
                Type = type
            });

            // Salvar de volta como JSON
            PhoneNumbersJson = JsonSerializer.Serialize(phoneNumbers);
            UpdatedAt = DateTime.UtcNow;
        }

        // Método para remover número de telefone (atualizado)
        public void RemovePhoneNumber(Guid phoneNumberId)
        {
            var phoneNumbers = JsonSerializer.Deserialize<List<PhoneNumberDto>>(PhoneNumbersJson) 
                ?? new List<PhoneNumberDto>();
                
            var phoneToRemove = phoneNumbers.FirstOrDefault(p => p.Id == phoneNumberId);
            if (phoneToRemove != null)
            {
                phoneNumbers.Remove(phoneToRemove);
                PhoneNumbersJson = JsonSerializer.Serialize(phoneNumbers);
                UpdatedAt = DateTime.UtcNow;
            }
        }

        // Helper para normalizar números de telefone
        private static string NormalizePhoneNumber(string number)
        {
            // Remove tudo exceto números
            return Regex.Replace(number, @"[^\d]", "");
        }

        // Outros métodos da classe Employee ...
        // (Métodos de validação e atualização permaneceriam os mesmos)
    }
}

// 2. DTO para números de telefone (migrado do modelo anterior)
public class PhoneNumberDto
{
    public Guid Id { get; set; }
    public string Number { get; set; }
    public PhoneType Type { get; set; }
}

// =========================== MIGRAÇÃO DO ENTITY FRAMEWORK ===========================

public class RemovePhoneNumberTableMigration : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Adicionar nova coluna PhoneNumbersJson na tabela Employees
        migrationBuilder.AddColumn<string>(
            name: "PhoneNumbersJson",
            table: "Employees",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "[]");
            
        // 2. Migrar dados de PhoneNumbers para Employees usando SQL
        migrationBuilder.Sql(@"
            -- Atualizar PhoneNumbersJson para cada funcionário com seus telefones
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
        ");
        
        // 3. Excluir a tabela PhoneNumbers após a migração dos dados
        migrationBuilder.DropTable(
            name: "PhoneNumbers");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // 1. Recriar a tabela PhoneNumbers
        migrationBuilder.CreateTable(
            name: "PhoneNumbers",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                Type = table.Column<int>(type: "int", nullable: false),
                EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PhoneNumbers", x => x.Id);
                table.ForeignKey(
                    name: "FK_PhoneNumbers_Employees",
                    column: x => x.EmployeeId,
                    principalTable: "Employees",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // 2. Migrar dados do JSON de volta para a tabela PhoneNumbers
        migrationBuilder.Sql(@"
            -- Inserir telefones de volta na tabela PhoneNumbers a partir do JSON em Employees
            DECLARE @EmployeeId UNIQUEIDENTIFIER
            DECLARE @PhoneJson NVARCHAR(MAX)
            
            DECLARE employee_cursor CURSOR FOR 
            SELECT Id, PhoneNumbersJson FROM Employees
            
            OPEN employee_cursor
            FETCH NEXT FROM employee_cursor INTO @EmployeeId, @PhoneJson
            
            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Inserir telefones usando OPENJSON para parsear o JSON
                INSERT INTO PhoneNumbers (Id, Number, Type, EmployeeId)
                SELECT 
                    CAST(JSON_VALUE(p.value, '$.Id') AS UNIQUEIDENTIFIER),
                    JSON_VALUE(p.value, '$.Number'),
                    CAST(JSON_VALUE(p.value, '$.Type') AS INT),
                    @EmployeeId
                FROM OPENJSON(@PhoneJson) AS p
                
                FETCH NEXT FROM employee_cursor INTO @EmployeeId, @PhoneJson
            END
            
            CLOSE employee_cursor
            DEALLOCATE employee_cursor
        ");

        // 3. Remover a coluna PhoneNumbersJson da tabela Employees
        migrationBuilder.DropColumn(
            name: "PhoneNumbersJson",
            table: "Employees");
    }
}

// =========================== ATUALIZAÇÕES NO DBCONTEXT ===========================

public class ApplicationDbContext : DbContext
{
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da entidade Employee (atualizada)
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.ToTable("Employees");
            entity.HasKey(e => e.Id);
            
            // ... Outras configurações permanecem as mesmas ...
            
            // Nova configuração para PhoneNumbersJson
            entity.Property(e => e.PhoneNumbersJson)
                .IsRequired()
                .HasDefaultValue("[]");
                
            // Ignorar a propriedade PhoneNumbers (que é calculada)
            entity.Ignore(e => e.PhoneNumbers);

            // Relacionamento auto-referenciante para gerentes
            entity.HasOne(e => e.Manager)
                .WithMany(e => e.Subordinates)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Configuração da entidade Department (mantida sem alterações)
        modelBuilder.Entity<Department>(entity =>
        {
            // ... Configuração atual mantida ...
        });
    }
    
    // Outros métodos do DbContext permanecem os mesmos
}

// =========================== ATUALIZAÇÕES NOS DTOS ===========================

namespace CompanyManager.Application.DTOs
{
    // DTOs atualizados - PhoneNumberDto já existe e permanece o mesmo
    
    // DTO para criar um novo funcionário (sem alterações, pois já funciona com PhoneNumberDto)
    public class CreateEmployeeDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string DocumentNumber { get; set; }
        public DateTime BirthDate { get; set; }
        public string Password { get; set; }
        public Role Role { get; set; }
        public string Department { get; set; }
        public Guid? ManagerId { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
    }
    
    // DTO para apresentação dos dados do funcionário (sem alterações, pois já funciona com PhoneNumberDto)
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string DocumentNumber { get; set; }
        public DateTime BirthDate { get; set; }
        public int Age { get; set; }
        public Role Role { get; set; }
        public string Department { get; set; }
        public Guid? ManagerId { get; set; }
        public string ManagerName { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    
    // Outros DTOs permanecem os mesmos
}

// =========================== ATUALIZAÇÕES NO REPOSITÓRIO ===========================

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Os métodos existentes permanecem quase idênticos, mas com uma pequena alteração:
    // Não precisamos mais fazer Include(e => e.PhoneNumbers) pois agora os telefones 
    // estão na própria entidade Employee como JSON
    
    public async Task<Employee> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.Manager)
            // Remover: .Include(e => e.PhoneNumbers)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
    
    // Atualizar os demais métodos de consulta da mesma forma, removendo os Include de PhoneNumbers
    
    // Outros métodos permanecem inalterados
}

// =========================== ATUALIZAÇÕES NO SERVIÇO ===========================

public class EmployeeService : IEmployeeService
{
    // A maior parte do serviço permanece inalterada, pois a lógica de negócios 
    // para adicionar e remover telefones já está encapsulada na entidade Employee.
    // Apenas o método de mapeamento precisa ser atualizado:
    
    private EmployeeDto MapToEmployeeDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            FullName = employee.FullName,
            Email = employee.Email,
            DocumentNumber = employee.DocumentNumber,
            BirthDate = employee.BirthDate,
            Age = CalculateAge(employee.BirthDate),
            Role = employee.Role,
            Department = employee.Department,
            ManagerId = employee.ManagerId,
            ManagerName = employee.Manager?.FullName,
            PhoneNumbers = employee.PhoneNumbers.ToList(), // Agora obtém diretamente da propriedade calculada
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt
        };
    }
    
    // Outros métodos permanecem inalterados
}

// =========================== CÓDIGO PARA SEED DE DADOS ===========================

public class EmployeeDataSeeder
{
    public static async Task SeedEmployeesAsync(ApplicationDbContext context)
    {
        // Verificar se já existem dados
        if (await context.Employees.AnyAsync())
            return;
            
        // Criar departamentos
        var departments = new List<Department>
        {
            Department.Create("TI", "Tecnologia da Informação"),
            Department.Create("RH", "Recursos Humanos"),
            Department.Create("Financeiro", "Departamento Financeiro"),
            Department.Create("Marketing", "Departamento de Marketing"),
            Department.Create("Vendas", "Equipe de Vendas")
        };
        
        await context.Departments.AddRangeAsync(departments);
        await context.SaveChangesAsync();
        
        // Lista para armazenar funcionários criados
        var employees = new List<Employee>();
        
        // Criar diretor (para ser gerente dos líderes)
        var director = Employee.Create(
            "Carlos", 
            "Silva", 
            "carlos.silva@empresa.com", 
            "123.456.789-00", 
            new DateTime(1975, 5, 15), 
            BCrypt.Net.BCrypt.HashPassword("Senha@123"), 
            Role.Director, 
            "TI"
        );
        director.AddPhoneNumber("(11) 98765-4321", PhoneType.Mobile);
        director.AddPhoneNumber("(11) 3333-4444", PhoneType.Work);
        employees.Add(director);
        
        // Criar líderes (para serem gerentes dos funcionários comuns)
        var leader1 = Employee.Create(
            "Ana", 
            "Oliveira", 
            "ana.oliveira@empresa.com", 
            "234.567.890-11", 
            new DateTime(1980, 8, 20), 
            BCrypt.Net.BCrypt.HashPassword("Senha@456"), 
            Role.Leader, 
            "RH",
            director.Id
        );
        leader1.AddPhoneNumber("(11) 97777-8888", PhoneType.Mobile);
        employees.Add(leader1);
        
        var leader2 = Employee.Create(
            "Roberto", 
            "Santos", 
            "roberto.santos@empresa.com", 
            "345.678.901-22", 
            new DateTime(1982, 3, 10), 
            BCrypt.Net.BCrypt.HashPassword("Senha@789"), 
            Role.Leader, 
            "Financeiro",
            director.Id
        );
        leader2.AddPhoneNumber("(11) 96666-7777", PhoneType.Mobile);
        leader2.AddPhoneNumber("(11) 2222-3333", PhoneType.Home);
        employees.Add(leader2);
        
        // Criar funcionários comuns
        var employee1 = Employee.Create(
            "Mariana", 
            "Costa", 
            "mariana.costa@empresa.com", 
            "456.789.012-33", 
            new DateTime(1990, 6, 25), 
            BCrypt.Net.BCrypt.HashPassword("Senha@012"), 
            Role.Employee, 
            "Marketing",
            leader1.Id
        );
        employee1.AddPhoneNumber("(11) 95555-6666", PhoneType.Mobile);
        employees.Add(employee1);
        
        var employee2 = Employee.Create(
            "Lucas", 
            "Ferreira", 
            "lucas.ferreira@empresa.com", 
            "567.890.123-44", 
            new DateTime(1988, 9, 15), 
            BCrypt.Net.BCrypt.HashPassword("Senha@345"), 
            Role.Employee, 
            "TI",
            director.Id
        );
        employee2.AddPhoneNumber("(11) 94444-5555", PhoneType.Mobile);
        employee2.AddPhoneNumber("(11) 1111-2222", PhoneType.Home);
        employees.Add(employee2);
        
        var employee3 = Employee.Create(
            "Julia", 
            "Almeida", 
            "julia.almeida@empresa.com", 
            "678.901.234-55", 
            new DateTime(1992, 11, 30), 
            BCrypt.Net.BCrypt.HashPassword("Senha@678"), 
            Role.Employee, 
            "RH",
            leader1.Id
        );
        employee3.AddPhoneNumber("(11) 93333-4444", PhoneType.Mobile);
        employees.Add(employee3);
        
        var employee4 = Employee.Create(
            "Felipe", 
            "Martins", 
            "felipe.martins@empresa.com", 
            "789.012.345-66", 
            new DateTime(1991, 4, 12), 
            BCrypt.Net.BCrypt.HashPassword("Senha@901"), 
            Role.Employee, 
            "Financeiro",
            leader2.Id
        );
        employee4.AddPhoneNumber("(11) 92222-3333", PhoneType.Mobile);
        employee4.AddPhoneNumber("(11) 5555-6666", PhoneType.Work);
        employees.Add(employee4);
        
        var employee5 = Employee.Create(
            "Gabriela", 
            "Lima", 
            "gabriela.lima@empresa.com", 
            "890.123.456-77", 
            new DateTime(1993, 7, 8), 
            BCrypt.Net.BCrypt.HashPassword("Senha@234"), 
            Role.Employee, 
            "Vendas",
            leader2.Id
        );
        employee5.AddPhoneNumber("(11) 91111-2222", PhoneType.Mobile);
        employees.Add(employee5);
        
        var employee6 = Employee.Create(
            "Rafael", 
            "Gomes", 
            "rafael.gomes@empresa.com", 
            "901.234.567-88", 
            new DateTime(1987, 2, 18), 
            BCrypt.Net.BCrypt.HashPassword("Senha@567"), 
            Role.Employee, 
            "Marketing",
            leader1.Id
        );
        employee6.AddPhoneNumber("(11) 90000-1111", PhoneType.Mobile);
        employee6.AddPhoneNumber("(11) 4444-5555", PhoneType.Home);
        employee6.AddPhoneNumber("(11) 6666-7777", PhoneType.Work);
        employees.Add(employee6);
        
        var employee7 = Employee.Create(
            "Aline", 
            "Souza", 
            "aline.souza@empresa.com", 
            "012.345.678-99", 
            new DateTime(1993, 10, 12), 
            BCrypt.Net.BCrypt.HashPassword("Senha@890"), 
            Role.Employee, 
            "TI",
            director.Id
        );
        employee7.AddPhoneNumber("(11) 99999-0000", PhoneType.Mobile);
        employees.Add(employee7);
        
        // Adicionar todos os funcionários ao contexto
        await context.Employees.AddRangeAsync(employees);
        await context.SaveChangesAsync();
    }
}

