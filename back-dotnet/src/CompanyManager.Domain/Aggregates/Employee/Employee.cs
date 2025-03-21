using System;
using System.Collections.Generic;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.ValueObjects;

namespace CompanyManager.Domain.Aggregates.Employee
{
    public class Employee : IHasTimestamps
    {
        private readonly List<PhoneNumber> _phoneNumbers = new();

        // Propriedades
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
        public IReadOnlyCollection<PhoneNumber> PhoneNumbers => _phoneNumbers.AsReadOnly();
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        // Construtor privado para EF Core
        private Employee() { }

        // Factory method principal
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
            // Validações
            ValidateName(firstName, lastName);
            ValidateEmail(email);
            ValidateDocumentNumber(documentNumber);
            ValidateAge(birthDate);

            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                Email = email.ToLower(),
                DocumentNumber = documentNumber,
                BirthDate = birthDate,
                PasswordHash = password, // Será tratado no serviço de aplicação
                Role = role,
                Department = department,
                ManagerId = managerId,
                CreatedAt = DateTime.UtcNow
            };

            return employee;
        }

        // Métodos para adicionar/remover telefones
        public void AddPhoneNumber(string number, PhoneType type)
        {
            var phoneNumber = PhoneNumber.Create(number, type);
            _phoneNumbers.Add(phoneNumber);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemovePhoneNumber(Guid phoneNumberId)
        {
            var phoneNumber = _phoneNumbers.Find(p => p.Id == phoneNumberId);
            if (phoneNumber != null)
            {
                _phoneNumbers.Remove(phoneNumber);
                UpdatedAt = DateTime.UtcNow;
            }
        }

        // Métodos de atualização
        public void Update(
            string firstName,
            string lastName,
            string email,
            DateTime birthDate,
            Role role,
            string department,
            Guid? managerId)
        {
            ValidateName(firstName, lastName);
            ValidateEmail(email);
            ValidateAge(birthDate);

            FirstName = firstName;
            LastName = lastName;
            Email = email.ToLower();
            BirthDate = birthDate;
            Role = role;
            Department = department;
            ManagerId = managerId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdatePassword(string newPasswordHash)
        {
            if (string.IsNullOrWhiteSpace(newPasswordHash))
                throw new DomainException("A senha não pode ser vazia.");

            PasswordHash = newPasswordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        // Métodos para manipulação de timestamps (para uso interno/infraestrutura)
        public void SetCreatedAt(DateTime createdAt)
        {
            CreatedAt = createdAt;
        }

        public void SetUpdatedAt(DateTime updatedAt)
        {
            UpdatedAt = updatedAt;
        }

        // Validações de domínio
        private static void ValidateName(string firstName, string lastName)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainException("O nome é obrigatório.");

            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainException("O sobrenome é obrigatório.");
        }

        private static void ValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new DomainException("O email é obrigatório.");

            // Uma validação básica, pode ser melhorada
            if (!email.Contains('@') || !email.Contains('.'))
                throw new DomainException("O email informado não é válido.");
        }

        private static void ValidateDocumentNumber(string documentNumber)
        {
            if (string.IsNullOrWhiteSpace(documentNumber))
                throw new DomainException("O número do documento é obrigatório.");
        }

        private static void ValidateAge(DateTime birthDate)
        {
            var age = DateTime.UtcNow.Year - birthDate.Year;
            if (birthDate.Date > DateTime.UtcNow.AddYears(-age)) age--;

            if (age < 18)
                throw new DomainException("O funcionário deve ter pelo menos 18 anos.");
        }

        // Propriedades de navegação para funcionários subordinados (caso necessário)
        public ICollection<Employee> Subordinates { get; private set; } = new List<Employee>();

        // Métodos de domínio para verificações de permissão
        public bool CanManage(Role subordinateRole)
        {
            // Diretores podem gerenciar todos
            if (Role == Role.Director)
                return true;

            // Líderes podem gerenciar apenas funcionários
            if (Role == Role.Leader && subordinateRole == Role.Employee)
                return true;

            // Funcionários não podem gerenciar ninguém
            return false;
        }

        // Nome completo (propriedade calculada)
        public string FullName => $"{FirstName} {LastName}";
    }
}