using System;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;

namespace CompanyManager.Domain.Aggregates.Department
{
    public class Department : IHasTimestamps
    {
        // Propriedades
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public bool IsActive { get; private set; }

        // Propriedades de timestamps
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        // Construtor privado para EF Core
        private Department() { }

        // Factory method principal
        public static Department Create(
            string name,
            string description)
        {
            ValidateName(name);

            var department = new Department
            {
                Id = Guid.NewGuid(),
                Name = name,
                Description = description ?? string.Empty,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            return department;
        }

        // Métodos de atualização
        public void Update(string name, string description)
        {
            ValidateName(name);

            Name = name;
            Description = description ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        // Implementações da interface IHasTimestamps
        public void SetCreatedAt(DateTime dateTime)
        {
            CreatedAt = dateTime;
        }

        public void SetUpdatedAt(DateTime? dateTime)
        {
            UpdatedAt = dateTime;
        }

        // Validações de domínio
        private static void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainException("O nome do departamento é obrigatório.");

            if (name.Length < 2)
                throw new DomainException("O nome do departamento deve ter pelo menos 2 caracteres.");

            if (name.Length > 50)
                throw new DomainException("O nome do departamento não pode exceder 50 caracteres.");
        }
    }
}