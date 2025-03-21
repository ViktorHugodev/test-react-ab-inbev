using System;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace CompanyManager.Infrastructure.Data
{
  public class ApplicationDbContext : DbContext
  {
    public DbSet<Employee> Employees { get; set; }

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

        // Relacionamento auto-referenciante para gerentes
        entity.HasOne(e => e.Manager)
                  .WithMany(e => e.Subordinates)
                  .HasForeignKey(e => e.ManagerId)
                  .OnDelete(DeleteBehavior.Restrict); // Impede exclusão em cascata
      });

      // Configuração para o Value Object PhoneNumber
      modelBuilder.Entity<PhoneNumber>(entity =>
      {
        entity.ToTable("PhoneNumbers");

        entity.HasKey(p => p.Id);

        entity.Property(p => p.Number)
                  .IsRequired()
                  .HasMaxLength(20);

        entity.Property(p => p.Type)
                  .IsRequired();
      });

      // Relacionamentos explícitos
      modelBuilder.Entity<Employee>()
          .HasMany<PhoneNumber>()
          .WithOne()
          .HasForeignKey("EmployeeId")
          .OnDelete(DeleteBehavior.Cascade);
    }

  public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    // Atualiza os timestamps para entidades modificadas
    foreach (var entry in ChangeTracker.Entries<Employee>())
    {
        if (entry.State == EntityState.Added)
        {
            entry.Entity.CreatedAt = DateTime.UtcNow;  // Acesso direto à propriedade
        }
        else if (entry.State == EntityState.Modified)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;  // Acesso direto à propriedade
        }
    }

    return base.SaveChangesAsync(cancellationToken);
}
  }
}