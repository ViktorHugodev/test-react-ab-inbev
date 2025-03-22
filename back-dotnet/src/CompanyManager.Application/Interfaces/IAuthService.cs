using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Domain.Enums;

namespace CompanyManager.Application.Interfaces
{
    public interface IAuthService
    {
        // Autenticação de usuário
        Task<AuthResponseDto> LoginAsync(
            LoginDto loginDto, 
            CancellationToken cancellationToken = default);
        
        // Verificação de senha
        Task<bool> VerifyPasswordAsync(
            string email, 
            string password, 
            CancellationToken cancellationToken = default);
        
        // Geração de hash de senha
        string HashPassword(string password);
        
        // Verificação de permissões
        bool HasPermission(Role currentUserRole, Role requiredRole);
        
        // Geração de token JWT
        string GenerateJwtToken(EmployeeDto employee);
        
        // Buscar funcionário pelo ID
        Task<EmployeeDto> GetEmployeeById(System.Guid id, CancellationToken cancellationToken = default);
        
        // Buscar funcionário pelo email
        Task<EmployeeDto> GetEmployeeByEmailAsync(string email, CancellationToken cancellationToken = default);
    }
}