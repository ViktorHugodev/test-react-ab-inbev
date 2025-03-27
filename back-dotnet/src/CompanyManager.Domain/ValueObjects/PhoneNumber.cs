using System;
using System.Text.RegularExpressions;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.ValueObjects;

namespace CompanyManager.Domain.ValueObjects
{
    public class PhoneNumber
    {
        public Guid Id { get; internal set; }
        public string Number { get; internal set; }
        public PhoneType Type { get; internal set; }
  
        // O EF Core e serialização JSON precisam deste construtor
        internal PhoneNumber() { }

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

        // Factory method para criar a partir de um DTO (usado na deserialização)
        internal static PhoneNumber FromDto(PhoneNumberDto dto)
        {
            return new PhoneNumber
            {
                Id = dto.Id,
                Number = dto.Number,
                Type = (PhoneType)dto.Type
            };
        }

        // Converte para DTO (usado para serialização)
        internal PhoneNumberDto ToDto()
        {
            return new PhoneNumberDto
            {
                Id = Id,
                Number = Number,
                Type = (int)Type
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