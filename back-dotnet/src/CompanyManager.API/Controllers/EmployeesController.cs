using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.API.Filters;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IAuthService _authService;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(
            IEmployeeService employeeService,
            IAuthService authService,
            ILogger<EmployeesController> logger)
        {
            _employeeService = employeeService;
            _authService = authService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeListItemDto>>> GetAll(CancellationToken cancellationToken)
        {
            var employees = await _employeeService.GetAllAsync(cancellationToken);
            return Ok(employees);
        }

        [HttpGet("paged")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResultDto<EmployeeListItemDto>>> GetPaged(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string searchTerm = null,
            [FromQuery] string department = null,
            [FromQuery] Guid? managerId = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _employeeService.GetPagedAsync(
                pageNumber,
                pageSize,
                searchTerm,
                department,
                managerId,
                cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var employee = await _employeeService.GetByIdAsync(id, cancellationToken);
                return Ok(employee);
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("department/{department}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeListItemDto>>> GetByDepartment(
            string department,
            CancellationToken cancellationToken)
        {
            var employees = await _employeeService.GetByDepartmentAsync(department, cancellationToken);
            return Ok(employees);
        }

        [HttpGet("manager/{managerId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeListItemDto>>> GetByManager(
            Guid managerId,
            CancellationToken cancellationToken)
        {
            var employees = await _employeeService.GetByManagerIdAsync(managerId, cancellationToken);
            return Ok(employees);
        }
        
        [HttpGet("leaders-directors")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeListItemDto>>> GetLeadersAndDirectors(
            CancellationToken cancellationToken)
        {
            var employees = await _employeeService.GetLeadersAndDirectorsAsync(cancellationToken);
            return Ok(employees);
        }

        [HttpPost]
        [Authorize(Roles = "Leader,Director")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<EmployeeDto>> Create(
            [FromBody] CreateEmployeeDto createEmployeeDto,
            CancellationToken cancellationToken)
        {
            try
            {
                // Verifica se o usuário atual tem permissão para criar um funcionário com o cargo especificado
                var currentUserRole = GetCurrentUserRole();
                if (!_authService.HasPermission(currentUserRole, createEmployeeDto.Role))
                {
                    return Forbid();
                }

                var createdEmployee = await _employeeService.CreateAsync(createEmployeeDto, cancellationToken);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = createdEmployee.Id },
                    createdEmployee);
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Leader,Director")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeDto>> Update(
            Guid id,
            [FromBody] UpdateEmployeeDto updateEmployeeDto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (id != updateEmployeeDto.Id)
                    return BadRequest(new { message = "O ID na URL não corresponde ao ID no corpo da requisição." });

                // Obtém o funcionário atual
                var currentEmployee = await _employeeService.GetByIdAsync(id, cancellationToken);
                if (currentEmployee == null)
                    return NotFound(new { message = $"Funcionário com ID {id} não encontrado." });

                // Verifica permissões
                var currentUserRole = GetCurrentUserRole();
                var currentUserId = GetCurrentUserId();

                // Diretores podem editar qualquer funcionário
                // Líderes só podem editar funcionários comuns
                // Funcionários só podem editar a si mesmos
                if (currentUserRole == Role.Director ||
                    (currentUserRole == Role.Leader && updateEmployeeDto.Role != Role.Director) ||
                    (currentUserId == id))
                {
                    var updatedEmployee = await _employeeService.UpdateAsync(updateEmployeeDto, cancellationToken);
                    return Ok(updatedEmployee);
                }

                return Forbid();
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpPatch("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeDto>> UpdatePartial(
            Guid id,
            [FromBody] EmployeePartialUpdateDto partialUpdateDto,
            CancellationToken cancellationToken)
        {
            try
            {
                // Atualizar o ID com o valor da URL
                partialUpdateDto.Id = id;
                
                // Obtém o funcionário atual
                var currentEmployee = await _employeeService.GetByIdAsync(id, cancellationToken);
                if (currentEmployee == null)
                    return NotFound(new { message = $"Funcionário com ID {id} não encontrado." });

                // Verifica permissões
                var currentUserRole = GetCurrentUserRole();
                var currentUserId = GetCurrentUserId();

                // Diretores podem editar qualquer funcionário
                // Líderes só podem editar funcionários comuns
                // Funcionários só podem editar a si mesmos
                var roleToCheck = partialUpdateDto.Role ?? currentEmployee.Role;
                if (currentUserRole == Role.Director ||
                    (currentUserRole == Role.Leader && roleToCheck != Role.Director) ||
                    (currentUserId == id))
                {
                    var updatedEmployee = await _employeeService.UpdatePartialAsync(partialUpdateDto, cancellationToken);
                    return Ok(updatedEmployee);
                }

                return Forbid();
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}/password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> UpdatePassword(
            Guid id,
            [FromBody] UpdatePasswordDto updatePasswordDto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (id != updatePasswordDto.EmployeeId)
                    return BadRequest(new { message = "O ID na URL não corresponde ao ID no corpo da requisição." });

                // Apenas o próprio usuário ou um diretor podem alterar a senha
                var currentUserRole = GetCurrentUserRole();
                var currentUserId = GetCurrentUserId();

                if (currentUserRole != Role.Director && currentUserId != id)
                    return Forbid();

                var result = await _employeeService.UpdatePasswordAsync(updatePasswordDto, cancellationToken);
                if (result)
                    return Ok(new { message = "Senha atualizada com sucesso." });

                return BadRequest(new { message = "Falha ao atualizar a senha." });
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidCredentialsException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                // Apenas diretores podem excluir funcionários
                var result = await _employeeService.DeleteAsync(id, cancellationToken);
                if (result)
                    return NoContent();

                return BadRequest(new { message = "Falha ao excluir o funcionário." });
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}/phones")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeDto>> UpdatePhoneNumbers(
            Guid id,
            [FromBody] UpdatePhoneNumbersDto updatePhoneNumbersDto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (id != updatePhoneNumbersDto.Id)
                    return BadRequest(new { message = "O ID na URL não corresponde ao ID no corpo da requisição." });

                // Obtém o funcionário atual
                var currentEmployee = await _employeeService.GetByIdAsync(id, cancellationToken);
                if (currentEmployee == null)
                    return NotFound(new { message = $"Funcionário com ID {id} não encontrado." });

                // Verifica permissões (usuário só pode editar os próprios telefones ou ser diretor/líder)
                var currentUserRole = GetCurrentUserRole();
                var currentUserId = GetCurrentUserId();

                if (currentUserRole == Role.Director || 
                    currentUserRole == Role.Leader || 
                    currentUserId == id)
                {
                    var updatedEmployee = await _employeeService.UpdatePhoneNumbersAsync(updatePhoneNumbersDto, cancellationToken);
                    return Ok(updatedEmployee);
                }

                return Forbid();
            }
            catch (EntityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Métodos auxiliares para obter informações do usuário atual
        private Role GetCurrentUserRole()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim != null && Enum.TryParse<Role>(roleClaim, out var role))
                return role;

            return Role.Employee; // Padrão mais restritivo
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
                return userId;

            return Guid.Empty;
        }
    }
}