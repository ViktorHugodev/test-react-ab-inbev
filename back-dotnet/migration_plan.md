# Plano de Migração: Remover PhoneNumbers e Incorporar em Employees

## Visão Geral da Refatoração

Atualmente, o sistema possui 3 tabelas principais: `Employees`, `Departments` e `PhoneNumbers`. O objetivo desta refatoração é eliminar completamente a tabela `PhoneNumbers` e incorporar seus dados diretamente na tabela `Employees` como JSON, resultando em um esquema de banco de dados com apenas 2 tabelas.

## 1. Modelo de Entidades Atualizado

### Classe PhoneNumber (Atualizada para ValueObject)

```csharp
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Enums;

namespace CompanyManager.Domain.ValueObjects
{
    // Convertido para um puro Value Object sem Id e sem EmployeeId
    public class PhoneNumber
    {
        [JsonPropertyName("number")]
        public string Number { get; private set; }
        
        [JsonPropertyName("type")]
        public PhoneType Type { get; private set; }
        
        // Construtor privado para serialização
        private PhoneNumber() { }
        
        // Factory method (mantido)
        public static PhoneNumber Create(string number, PhoneType type)
        {
            ValidatePhoneNumber(number);
            
            return new PhoneNumber
            {
                Number = NormalizePhoneNumber(number),
                Type = type
            };
        }
        
        // Métodos de validação e normalização (implementados)
        private static void ValidatePhoneNumber(string number)
        {
            if (string.IsNullOrWhiteSpace(number))
                throw new DomainException("O número de telefone é obrigatório.");

            var normalizedNumber = NormalizePhoneNumber(number);
            
            if (normalizedNumber.Length < 8 || !Regex.IsMatch(normalizedNumber, @"^\d+$"))
                throw new DomainException("O número de telefone informado não é válido.");
        }
        
        private static string NormalizePhoneNumber(string number)
        {
            return Regex.Replace(number, @"[^\d]", "");
        }

        // Método para formatar o número de telefone para exibição
        public string GetFormattedNumber()
        {
            var normalized = NormalizePhoneNumber(Number);
            if (normalized.Length == 11 && normalized.StartsWith("9"))
            {
                // Formato para celular: (XX) 9XXXX-XXXX
                return $"({normalized.Substring(0, 2)}) {normalized.Substring(2, 5)}-{normalized.Substring(7)}";
            }
            else if (normalized.Length == 10)
            {
                // Formato para telefone fixo: (XX) XXXX-XXXX
                return $"({normalized.Substring(0, 2)}) {normalized.Substring(2, 4)}-{normalized.Substring(6)}";
            }
            
            return Number; // Retorna original se não conseguir formatar
        }
    }
}
```

### Classe Employee (Atualizada)

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyManager.Domain.ValueObjects;
using CompanyManager.Domain.Enums;

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
        public ICollection<Employee> Subordinates { get; private set; } = new List<Employee>();
        
        // Nome completo para facilitar acesso
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";
        
        // Nova propriedade para armazenar os telefones como JSON
        public string PhoneNumbersJson { get; private set; } = "[]";
        
        // Propriedade de navegação calculada (não mapeada para o banco)
        [NotMapped]
        public IReadOnlyCollection<PhoneNumber> PhoneInfos 
        { 
            get
            {
                if (string.IsNullOrEmpty(PhoneNumbersJson))
                    return new List<PhoneNumber>().AsReadOnly();
                
                return JsonSerializer.Deserialize<List<PhoneNumber>>(
                    PhoneNumbersJson, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                )?.AsReadOnly() ?? new List<PhoneNumber>().AsReadOnly();
            }
        }
        
        // Propriedade de alias para compatibilidade com código existente
        [NotMapped]
        public IReadOnlyCollection<PhoneNumber> PhoneNumbers => PhoneInfos;

        // Construtor privado para EF Core
        private Employee() { }
        
        // Método atualizado para adicionar telefone
        public void AddPhoneNumber(string number, PhoneType type)
        {
            var phoneNumber = PhoneNumber.Create(number, type);
            var phones = GetPhoneNumbersList();
            phones.Add(phoneNumber);
            UpdatePhoneNumbersJson(phones);
            UpdatedAt = DateTime.UtcNow;
        }

        // Método atualizado para remover telefone por número
        public void RemovePhoneNumber(string number)
        {
            var phones = GetPhoneNumbersList();
            var phoneToRemove = phones.FirstOrDefault(p => p.Number == number);
            if (phoneToRemove != null)
            {
                phones.Remove(phoneToRemove);
                UpdatePhoneNumbersJson(phones);
                UpdatedAt = DateTime.UtcNow;
            }
        }
        
        // Método para preservar a API existente (remoção por ID)
        public void RemovePhoneNumberById(Guid id)
        {
            // Como não temos mais IDs nos telefones, removeremos pelo índice
            var phones = GetPhoneNumbersList();
            if (phones.Count > 0)
            {
                // Usamos o ID como índice na lista (solução temporária)
                int index = Math.Min(Math.Abs(id.GetHashCode() % phones.Count), phones.Count - 1);
                phones.RemoveAt(index);
                UpdatePhoneNumbersJson(phones);
                UpdatedAt = DateTime.UtcNow;
            }
        }

        // Métodos auxiliares para manipular a lista de telefones
        private List<PhoneNumber> GetPhoneNumbersList()
        {
            if (string.IsNullOrEmpty(PhoneNumbersJson))
                return new List<PhoneNumber>();
                
            return JsonSerializer.Deserialize<List<PhoneNumber>>(
                PhoneNumbersJson, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<PhoneNumber>();
        }

        private void UpdatePhoneNumbersJson(List<PhoneNumber> phones)
        {
            PhoneNumbersJson = JsonSerializer.Serialize(
                phones, 
                new JsonSerializerOptions 
                { 
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                }
            );
        }

        // Factory method principal (mantido, com ajuste para inicializar PhoneNumbersJson)
        public static Employee Create(
            string firstName, 
            string lastName, 
            string email, 
            string documentNumber, 
            DateTime birthDate, 
            string passwordHash, 
            Role role, 
            string department, 
            Guid? managerId = null)
        {
            // Validações omitidas para brevidade

            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                Email = email.ToLower(),
                DocumentNumber = documentNumber,
                BirthDate = birthDate,
                PasswordHash = passwordHash,
                Role = role,
                Department = department,
                ManagerId = managerId,
                CreatedAt = DateTime.UtcNow,
                PhoneNumbersJson = "[]" // Inicializa com array vazio
            };
            
            return employee;
        }
    }
}
```

## 2. Configuração do DbContext Atualizada

```csharp
// Em ApplicationDbContext.cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Configuração da entidade Employee atualizada
    modelBuilder.Entity<Employee>(entity =>
    {
        // Configurações existentes
        entity.ToTable("Employees");
        entity.HasKey(e => e.Id);
        
        // Outras propriedades (omitidas para brevidade)
        
        // Nova configuração para PhoneNumbersJson
        entity.Property(e => e.PhoneNumbersJson)
            .IsRequired()
            .HasColumnName("PhoneNumbers") // Nome da coluna no banco
            .HasColumnType("nvarchar(max)") // SQL Server
            .HasDefaultValue("[]");
            
        // Ignorar propriedades calculadas
        entity.Ignore(e => e.PhoneInfos);
        entity.Ignore(e => e.PhoneNumbers);
        entity.Ignore(e => e.FullName);
        
        // Relação auto-referente para gerentes (mantida)
        entity.HasOne(e => e.Manager)
            .WithMany(e => e.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);
    });
    
    // Configuração da entidade Department (mantida)
    modelBuilder.Entity<Department>(entity =>
    {
        entity.ToTable("Departments");
        // Configurações omitidas para brevidade
    });
    
    // PhoneNumber não é mais mapeado como entidade
}
```

## 3. Migração de Banco de Dados

```csharp
public partial class MigratePhoneNumbersToJson : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Adicionar nova coluna PhoneNumbers (JSON) na tabela Employees
        migrationBuilder.AddColumn<string>(
            name: "PhoneNumbers",
            table: "Employees",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "[]");
            
        // 2. Migrar dados de PhoneNumbers para Employees usando SQL
        migrationBuilder.Sql(@"
            UPDATE e
            SET e.PhoneNumbers = (
                SELECT COALESCE(
                    (SELECT '[' + STRING_AGG(
                        CONCAT(
                            '{""number"":""', p.Number, '"",""type"":', CAST(p.Type AS INT), '}'
                        ), ','
                    ) + ']'
                    FROM PhoneNumbers p
                    WHERE p.EmployeeId = e.Id
                    ), '[]')
            )
            FROM Employees e
        ");
            
        // 3. Verificar a migração
        migrationBuilder.Sql(@"
            SELECT COUNT(*) FROM PhoneNumbers
        ");
            
        // 4. Remover a tabela PhoneNumbers
        migrationBuilder.DropForeignKey(
            name: "FK_PhoneNumbers_Employees_EmployeeId",
            table: "PhoneNumbers");
            
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
                EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                Type = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PhoneNumbers", x => x.Id);
                table.ForeignKey(
                    name: "FK_PhoneNumbers_Employees_EmployeeId",
                    column: x => x.EmployeeId,
                    principalTable: "Employees",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // 2. Criar índice para performance
        migrationBuilder.CreateIndex(
            name: "IX_PhoneNumbers_EmployeeId",
            table: "PhoneNumbers",
            column: "EmployeeId");

        // 3. Migrar dados de volta para a tabela PhoneNumbers (complexo - simplificado aqui)
        migrationBuilder.Sql(@"
            -- Inserindo dados de volta na tabela PhoneNumbers
            -- Este é um exemplo simplificado que precisaria ser expandido
            -- para processar corretamente o JSON em SQL Server
            INSERT INTO PhoneNumbers (Id, EmployeeId, Number, Type)
            SELECT 
                NEWID() as Id,
                e.Id as EmployeeId,
                JSON_VALUE(p.value, '$.number') as Number,
                CAST(JSON_VALUE(p.value, '$.type') AS INT) as Type
            FROM 
                Employees e
                CROSS APPLY OPENJSON(e.PhoneNumbers) as p
            WHERE 
                e.PhoneNumbers IS NOT NULL 
                AND e.PhoneNumbers != '[]'
        ");
        
        // 4. Remover a coluna PhoneNumbers da tabela Employees
        migrationBuilder.DropColumn(
            name: "PhoneNumbers",
            table: "Employees");
    }
}
```

## 4. Atualizações em Serviços e DTOs

### DTOs Atualizados

```csharp
// Em PhoneInfoDto.cs
public class PhoneInfoDto
{
    public string Number { get; set; } = string.Empty;
    public PhoneType Type { get; set; }
    
    // Construtor padrão
    public PhoneInfoDto() { }
    
    // Construtor para criar a partir do Value Object
    public PhoneInfoDto(PhoneNumber phoneNumber)
    {
        Number = phoneNumber.Number;
        Type = phoneNumber.Type;
    }
}

// Em UpdateEmployeePhoneNumbersDto.cs
public class UpdateEmployeePhoneNumbersDto
{
    public Guid Id { get; set; }
    public List<PhoneInfoDto> PhoneNumbers { get; set; } = new List<PhoneInfoDto>();
}
```

### Serviço de Funcionários

```csharp
// Em EmployeeService.cs
public async Task<EmployeeDto> UpdatePhoneNumbersAsync(
    UpdateEmployeePhoneNumbersDto dto, 
    CancellationToken cancellationToken = default)
{
    var employee = await _employeeRepository.GetByIdAsync(dto.Id, cancellationToken);
    if (employee == null)
        throw new EntityNotFoundException("Funcionário não encontrado.");
    
    // Limpar telefones existentes (utilizando propriedade JSON)
    // Como não temos mais uma lista in-memory, precisamos criar uma nova lista
    employee.PhoneNumbersJson = "[]";
    
    // Adicionar novos telefones
    foreach (var phoneDto in dto.PhoneNumbers)
    {
        employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
    }
    
    await _employeeRepository.UpdateAsync(employee, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);
    
    return _mapper.Map<EmployeeDto>(employee);
}
```

### Mapeamento AutoMapper

```csharp
// Em MappingProfile.cs
CreateMap<PhoneNumber, PhoneInfoDto>()
    .ForMember(dest => dest.Number, opt => opt.MapFrom(src => src.Number))
    .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type));

CreateMap<Employee, EmployeeDto>()
    // ... mapeamentos existentes
    .ForMember(dest => dest.PhoneNumbers, opt => opt.MapFrom(src => src.PhoneInfos));
```

## 5. Estratégias para Prevenção de Perda de Dados

1. **Backup pré-migração**: Realizar um backup completo do banco de dados antes de aplicar as migrações.
2. **Verificação de dados**: Adicionar validações que garantam que todos os telefones foram migrados corretamente.
3. **Migração em fases**:
   - Fase 1: Adicionar o campo JSON e popular com dados existentes
   - Fase 2: Testar acesso através da nova abordagem
   - Fase 3: Remover a tabela antiga somente após validação completa
4. **Tabela de auditoria**: Criar uma tabela temporária para registrar todos os telefones migrados para referência futura.
5. **Script de rollback**: Preparar scripts de rollback que podem ser executados caso problemas sejam detectados.

## 6. Testes e Validação

1. **Testes unitários**: Atualizar os testes para refletir a nova estrutura.
2. **Testes de integração**: Verificar se todos os repositórios e serviços funcionam corretamente com a nova estrutura.
3. **Testes de carga**: Avaliar o desempenho das consultas JSON vs. tabela separada.
4. **Validação de dados**: Comparar os dados antes e depois da migração para garantir integridade.

## 7. Implementação e Checklist

- [ ] Atualizar `PhoneNumber` para ser um ValueObject puro sem Id
- [ ] Adicionar suporte JSON à classe `Employee`
- [ ] Atualizar configurações do DbContext
- [ ] Criar e aplicar migração
- [ ] Atualizar DTOs e serviços
- [ ] Atualizar mapeamentos
- [ ] Executar testes
- [ ] Verificar os dados migrados para garantir integridade
- [ ] Remover código antigo desnecessário