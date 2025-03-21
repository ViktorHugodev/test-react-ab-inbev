using System;
using System.Collections.Generic;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.ValueObjects;

namespace CompanyManager.Application.DTOs
{
    // DTO para criar um novo funcionário
    public class CreateEmployeeDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string DocumentNumber { get; set; }
        public DateTime BirthDate { get; set; }
        public string Password { get; set; }
        public Role Role { get; set; }
        public string Department { get; set; }
        public Guid? ManagerId { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
    }

    // DTO para atualizar um funcionário existente
    public class UpdateEmployeeDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime BirthDate { get; set; }
        public Role Role { get; set; }
        public string Department { get; set; }
        public Guid? ManagerId { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
    }

    // DTO para atualizar a senha
    public class UpdatePasswordDto
    {
        public Guid EmployeeId { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }

    // DTO para apresentação dos dados do funcionário
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string DocumentNumber { get; set; }
        public DateTime BirthDate { get; set; }
        public int Age { get; set; }
        public Role Role { get; set; }
        public string Department { get; set; }
        public Guid? ManagerId { get; set; }
        public string ManagerName { get; set; }
        public List<PhoneNumberDto> PhoneNumbers { get; set; } = new List<PhoneNumberDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // DTO para listagem simplificada de funcionários
    public class EmployeeListItemDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public Role Role { get; set; }
        public string ManagerName { get; set; }
    }

    // DTO para número de telefone
    public class PhoneNumberDto
    {
        public Guid? Id { get; set; }
        public string Number { get; set; }
        public PhoneType Type { get; set; }
    }

    // DTO para paginação de resultados
    public class PagedResultDto<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    // DTO para login
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // DTO para resposta de autenticação
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public EmployeeDto Employee { get; set; }
    }
}