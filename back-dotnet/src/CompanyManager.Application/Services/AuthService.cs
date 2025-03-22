using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CompanyManager.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUnitOfWork unitOfWork,
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }
        
        public async Task<EmployeeDto> GetEmployeeById(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(id, cancellationToken);
                if (employee == null)
                    return null;
                    
                return MapToEmployeeDto(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar funcionário pelo ID: {Id}", id);
                return null;
            }
        }
        
        public async Task<EmployeeDto> GetEmployeeByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByEmailAsync(email, cancellationToken);
                if (employee == null)
                    return null;
                    
                return MapToEmployeeDto(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar funcionário pelo email: {Email}", email);
                return null;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(
            LoginDto loginDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByEmailAsync(loginDto.Email, cancellationToken);
                if (employee == null)
                    throw new InvalidCredentialsException("Email ou senha inválidos.");

                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, employee.PasswordHash))
                    throw new InvalidCredentialsException("Email ou senha inválidos.");

                var employeeDto = MapToEmployeeDto(employee);

                // Gera token JWT
                var token = GenerateJwtToken(employeeDto);

                var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);

                _logger.LogInformation("Login bem-sucedido para o usuário: {Email}", loginDto.Email);

                return new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    Employee = employeeDto
                };
            }
            catch (Exception ex) when (ex is not ApplicationException)
            {
                _logger.LogError(ex, "Erro durante login: {ErrorMessage}", ex.Message);
                throw new ApplicationException("Ocorreu um erro durante a autenticação. Por favor, tente novamente.", ex);
            }
        }

        public async Task<bool> VerifyPasswordAsync(
            string email,
            string password,
            CancellationToken cancellationToken = default)
        {
            var employee = await _unitOfWork.Employees.GetByEmailAsync(email, cancellationToken);
            if (employee == null)
                return false;

            return BCrypt.Net.BCrypt.Verify(password, employee.PasswordHash);
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool HasPermission(Role currentUserRole, Role requiredRole)
        {
            if (currentUserRole == Role.Director)
                return true;

            if (currentUserRole == Role.Leader)
                return requiredRole != Role.Director;

            return false;
        }

        public string GenerateJwtToken(EmployeeDto employee)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, employee.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, employee.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, employee.FullName),
                new Claim(ClaimTypes.Role, employee.Role.ToString())
            };

            // Usa a secret do _jwtSettings
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private EmployeeDto MapToEmployeeDto(Employee employee)
        {
            return new EmployeeDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                DocumentNumber = employee.DocumentNumber,
                BirthDate = employee.BirthDate,
                Age = CalculateAge(employee.BirthDate),
                Role = employee.Role,
                Department = employee.Department,
                ManagerId = employee.ManagerId,
                ManagerName = employee.Manager?.FullName,
                PhoneNumbers = employee.PhoneNumbers.Select(p => new PhoneNumberDto
                {
                    Id = p.Id,
                    Number = p.Number,
                    Type = p.Type
                }).ToList(),
                CreatedAt = employee.CreatedAt,
                UpdatedAt = employee.UpdatedAt
            };
        }

        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }
    }

    // JWT Settings
    public class JwtSettings
    {
        public string Secret { get; set; }
        public int ExpiryMinutes { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
    }
}
