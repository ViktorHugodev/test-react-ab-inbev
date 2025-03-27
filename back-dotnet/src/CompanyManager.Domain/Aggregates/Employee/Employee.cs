using System;
using System.Collections.Generic;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using CompanyManager.Domain.ValueObjects;
using System.Linq;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyManager.Domain.Aggregates.Employee
{
    public class Employee : IHasTimestamps
    {
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
        
        // Nova propriedade para armazenar os números de telefone como JSON
        public string PhoneNumbersJson { get; private set; } = "[]";
        
        // Propriedade calculada para acesso aos números de telefone
        [NotMapped]
        public IReadOnlyCollection<PhoneNumber> PhoneNumbers 
        { 
            get 
            {
                if (string.IsNullOrEmpty(PhoneNumbersJson))
                    return new List<PhoneNumber>().AsReadOnly();
                    
                try
                {
                    var phoneNumberDtos = JsonSerializer.Deserialize<List<PhoneNumberDto>>(PhoneNumbersJson) ?? new List<PhoneNumberDto>();
                    var phoneNumbers = phoneNumberDtos.Select(PhoneNumber.FromDto).ToList();
                    return phoneNumbers.AsReadOnly();
                }
                catch
                {
                    return new List<PhoneNumber>().AsReadOnly();
                }
            }
        }

        // Propriedades de timestamps
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        // Propriedades de navegação para funcionários subordinados
        public ICollection<Employee> Subordinates { get; private set; } = new List<Employee>();

        // Construtor privado para EF Core
        private Employee() { }
        
        // Construtor para testes
        public Employee(
            string firstName, 
            string lastName, 
            string email, 
            string documentNumber, 
            DateTime birthDate, 
            Role role, 
            string department, 
            Guid? managerId = null)
        {
            ValidateName(firstName, lastName);
            ValidateEmail(email);
            ValidateDocumentNumber(documentNumber);
            ValidateAge(birthDate);

            Id = Guid.NewGuid();
            FirstName = firstName;
            LastName = lastName;
            Email = email.ToLower();
            DocumentNumber = documentNumber;
            BirthDate = birthDate;
            Role = role;
            Department = department;
            ManagerId = managerId;
            CreatedAt = DateTime.UtcNow;
        }
        
        // Método para testes
        public void SetPasswordHash(string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new DomainException("A senha não pode ser vazia.");
                
            PasswordHash = passwordHash;
        }

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
                PasswordHash = password, // Gerado/criptografado no Application Service
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
            
            // Obter a lista atual de telefones
            var phoneNumbers = JsonSerializer.Deserialize<List<PhoneNumberDto>>(PhoneNumbersJson) 
                ?? new List<PhoneNumberDto>();

            // Adicionar novo telefone como DTO
            phoneNumbers.Add(phoneNumber.ToDto());

            // Salvar de volta como JSON
            PhoneNumbersJson = JsonSerializer.Serialize(phoneNumbers);
            UpdatedAt = DateTime.UtcNow;
        }

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
        
        // Método para atualização parcial
        public void UpdatePartial(
            string? firstName = null,
            string? lastName = null,
            string? email = null,
            DateTime? birthDate = null,
            Role? role = null,
            string? department = null,
            Guid? managerId = null)
        {
            // Valida e atualiza apenas os campos que foram fornecidos
            if (firstName != null && lastName != null)
            {
                ValidateName(firstName, lastName);
                FirstName = firstName;
                LastName = lastName;
            }
            else if (firstName != null)
            {
                ValidateName(firstName, LastName);
                FirstName = firstName;
            }
            else if (lastName != null)
            {
                ValidateName(FirstName, lastName);
                LastName = lastName;
            }
            
            if (email != null)
            {
                ValidateEmail(email);
                Email = email.ToLower();
            }
            
            if (birthDate.HasValue)
            {
                ValidateAge(birthDate.Value);
                BirthDate = birthDate.Value;
            }
            
            if (role.HasValue)
            {
                Role = role.Value;
            }
            
            if (department != null)
            {
                Department = department;
            }
            
            // ManagerId pode ser atualizado para null (remover gerente) ou para outro valor
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

            // Uma validação simples, pode ser aprimorada
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
            if (birthDate.Date > DateTime.UtcNow.AddYears(-age)) 
                age--;

            if (age < 18)
                throw new DomainException("O funcionário deve ter pelo menos 18 anos.");
        }

        // Métodos de domínio para verificações de permissão
        public bool CanManage(Role subordinateRole)
        {
            // Diretores podem gerenciar todos
            if (Role == Role.Director)
                return true;

            // Líderes só gerenciam funcionários regulares
            if (Role == Role.Leader && subordinateRole == Role.Employee)
                return true;

            // Funcionários comuns não gerenciam ninguém
            return false;
        }

        // Propriedade calculada
        public string FullName => $"{FirstName} {LastName}";
    }
}
