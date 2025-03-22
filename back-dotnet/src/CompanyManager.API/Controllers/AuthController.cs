using System;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> Login(
            [FromBody] LoginDto loginDto,
            CancellationToken cancellationToken)
        {
            try
            {
                var authResponse = await _authService.LoginAsync(loginDto, cancellationToken);
                return Ok(authResponse);
            }
            catch (InvalidCredentialsException ex)
            {
                _logger.LogWarning("Tentativa de login falhou para o email: {Email}", loginDto.Email);
                return Unauthorized(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Erro de autenticação: {ErrorMessage}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Erro ao realizar login. Por favor, tente novamente." });
            }
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            // Extrair informações do usuário a partir do token JWT
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
                
            var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value 
                ?? User.FindFirst("email")?.Value;
            
            _logger.LogInformation("Tentativa de obter usuário atual. Claims encontradas - ID: {Id}, Email: {Email}", 
                idClaim, emailClaim);
            
            // Se temos um email válido nas claims, usamos ele para buscar o funcionário completo
            if (!string.IsNullOrEmpty(emailClaim))
            {
                try 
                {
                    var employee = await _authService.GetEmployeeByEmailAsync(emailClaim, cancellationToken);
                    if (employee != null)
                    {
                        _logger.LogInformation("Usuário encontrado pelo email: {Email}", emailClaim);
                        return Ok(new
                        {
                            Id = employee.Id.ToString(),
                            Email = employee.Email,
                            Name = employee.FullName,
                            Role = employee.Role
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao buscar funcionário pelo email: {Email}", emailClaim);
                }
            }
            
            // Se temos um ID válido nas claims, usamos ele para buscar o funcionário completo
            if (!string.IsNullOrEmpty(idClaim) && Guid.TryParse(idClaim, out var userId))
            {
                try
                {
                    var employee = await _authService.GetEmployeeById(userId, cancellationToken);
                    if (employee != null)
                    {
                        _logger.LogInformation("Usuário encontrado pelo ID: {Id}", idClaim);
                        return Ok(new
                        {
                            Id = employee.Id.ToString(),
                            Email = employee.Email,
                            Name = employee.FullName,
                            Role = employee.Role
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao buscar funcionário pelo ID: {Id}", idClaim);
                }
            }
            
            // Se não conseguimos encontrar o usuário pelos métodos acima, retornamos um erro 401
            _logger.LogWarning("Não foi possível encontrar usuário com as claims fornecidas");
            return Unauthorized(new { message = "Usuário não encontrado ou não autenticado corretamente." });
        }
    }
}