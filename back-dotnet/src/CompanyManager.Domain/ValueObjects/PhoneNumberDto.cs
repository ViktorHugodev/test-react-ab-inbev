using System;
using CompanyManager.Domain.ValueObjects;

namespace CompanyManager.Domain.ValueObjects
{
    // DTO para número de telefone utilizado na serialização JSON
    public class PhoneNumberDto
    {
        public Guid Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public int Type { get; set; } // Usando int em vez de enum para facilitar serialização
    }
}
