using System;
using System.Text.RegularExpressions;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;

namespace CompanyManager.Domain.ValueObjects
{
    public class PhoneNumber
    {
        public Guid Id { get; private set; }
        public string Number { get; private set; }
        public PhoneType Type { get; private set; }
  public Guid EmployeeId { get; private set; } 
        // Construtor privado para Entity Framework
        private PhoneNumber() { }

        // Factory method
        public static PhoneNumber Create(string number, PhoneType type)
        {
            ValidatePhoneNumber(number);

            return new PhoneNumber
            {
                Id = Guid.NewGuid(),
                Number = NormalizePhoneNumber(number),
                Type = type
            };
        }

        private static void ValidatePhoneNumber(string number)
        {
            if (string.IsNullOrWhiteSpace(number))
                throw new DomainException("O número de telefone é obrigatório.");

            // Remove formatação para validação
            var normalizedNumber = NormalizePhoneNumber(number);
            
            // Validação simplificada - ajuste conforme necessário
            if (normalizedNumber.Length < 8 || !Regex.IsMatch(normalizedNumber, @"^\d+$"))
                throw new DomainException("O número de telefone informado não é válido.");
        }

        private static string NormalizePhoneNumber(string number)
        {
            // Remove tudo exceto números
            return Regex.Replace(number, @"[^\d]", "");
        }
    }

    public enum PhoneType
    {
        Mobile = 1,
        Home = 2,
        Work = 3,
        Other = 4
    }
}