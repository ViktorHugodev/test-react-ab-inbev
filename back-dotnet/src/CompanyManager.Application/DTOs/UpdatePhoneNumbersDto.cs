using System;
using System.Collections.Generic;
using CompanyManager.Domain.ValueObjects;

namespace CompanyManager.Application.DTOs
{
    public class UpdatePhoneNumbersDto
    {
        public Guid Id { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
    }
}
