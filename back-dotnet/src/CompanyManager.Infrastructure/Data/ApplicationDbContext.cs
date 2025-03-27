using System;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace CompanyManager.Infrastructure.Data
{
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

      // Configuração da entidade Employee
      modelBuilder.Entity<Employee>(entity =>
      {
        entity.ToTable("Employees");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.FirstName)
                  .IsRequired()
                  .HasMaxLength(50);

        entity.Property(e => e.LastName)
                  .IsRequired()
                  .HasMaxLength(50);

        entity.Property(e => e.Email)
                  .IsRequired()
                  .HasMaxLength(100);

        entity.HasIndex(e => e.Email)
                  .IsUnique();

        entity.Property(e => e.DocumentNumber)
                  .IsRequired()
                  .HasMaxLength(20);

        entity.HasIndex(e => e.DocumentNumber)
                  .IsUnique();

        entity.Property(e => e.BirthDate)
                  .IsRequired();

        entity.Property(e => e.PasswordHash)
                  .IsRequired()
                  .HasMaxLength(100);

        entity.Property(e => e.Department)
                  .IsRequired()
                  .HasMaxLength(50);

        entity.Property(e => e.CreatedAt)
                  .IsRequired();

        entity.Property(e => e.UpdatedAt);

        // Novo campo para armazenar números de telefone como JSON
        entity.Property(e => e.PhoneNumbersJson)
              .IsRequired()
              .HasDefaultValue("[]");

        // Relacionamento auto-referenciante para gerentes
        entity.HasOne(e => e.Manager)
                  .WithMany(e => e.Subordinates)
                  .HasForeignKey(e => e.ManagerId)
                  .OnDelete(DeleteBehavior.Restrict); // Impede exclusão em cascata
      });

      // Configuração da entidade Department
      modelBuilder.Entity<Department>(entity =>
      {
        entity.ToTable("Departments");

        entity.HasKey(d => d.Id);

        entity.Property(d => d.Name)
              .IsRequired()
              .HasMaxLength(50);

        entity.Property(d => d.Description)
              .HasMaxLength(200);

        entity.Property(d => d.IsActive)
              .IsRequired();

        entity.Property(d => d.CreatedAt)
              .IsRequired();

        entity.Property(d => d.UpdatedAt);

        entity.HasIndex(d => d.Name)
              .IsUnique();
      });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
      try
      {
        // Atualiza os timestamps para entidades modificadas
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is IHasTimestamps && 
                   (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
          var entity = entry.Entity as IHasTimestamps;
          
          if (entity != null)
          {
            if (entry.State == EntityState.Added)
            {
              // Usa a interface para definir a data de criação
              entity.SetCreatedAt(DateTime.UtcNow);
            }
            else if (entry.State == EntityState.Modified)
            {
              // Usa a interface para definir a data de atualização
              entity.SetUpdatedAt(DateTime.UtcNow);
            }
          }
        }

        // Aplicar regras de conexão mais tolerantes para minimizar erros de concorrência
        this.Database.SetCommandTimeout(120); // 2 minutos de timeout
        
        return base.SaveChangesAsync(cancellationToken);
      }
      catch (DbUpdateConcurrencyException ex)
      {
        // Trata erros de concorrência para que o seed não falhe
        Console.WriteLine($"Erro de concorrência ao salvar dados: {ex.Message}");
        
        // Atualiza as entradas com dados mais recentes do banco de dados
        foreach (var entry in ex.Entries)
        {
          // Recarrega a entrada do banco de dados
          entry.Reload();
        }
        
        // Tenta novamente a operação
        return this.SaveChangesAsync(cancellationToken);
      }
    }
  }
}