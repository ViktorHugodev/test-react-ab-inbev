using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
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
        public ActionResult GetCurrentUser()
        {
            // Extrair informações do usuário a partir do token JWT
            return Ok(new
            {
                Id = User.FindFirst("sub")?.Value,
                Email = User.FindFirst("email")?.Value,
                Name = User.FindFirst("name")?.Value,
                Role = User.FindFirst("role")?.Value
            });
        }
    }
}