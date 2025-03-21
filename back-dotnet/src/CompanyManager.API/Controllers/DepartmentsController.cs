using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
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
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentsController> _logger;

        public DepartmentsController(
            IDepartmentService departmentService,
            ILogger<DepartmentsController> logger)
        {
            _departmentService = departmentService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll(CancellationToken cancellationToken)
        {
            var departments = await _departmentService.GetAllAsync(cancellationToken);
            return Ok(departments);
        }

        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetActive(CancellationToken cancellationToken)
        {
            var departments = await _departmentService.GetActiveAsync(cancellationToken);
            return Ok(departments);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DepartmentDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var department = await _departmentService.GetByIdAsync(id, cancellationToken);
                return Ok(department);
            }
            catch (DepartmentNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<DepartmentDto>> Create(
            [FromBody] CreateDepartmentDto createDepartmentDto,
            CancellationToken cancellationToken)
        {
            try
            {
                var createdDepartment = await _departmentService.CreateAsync(createDepartmentDto, cancellationToken);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = createdDepartment.Id },
                    createdDepartment);
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DepartmentDto>> Update(
            Guid id,
            [FromBody] UpdateDepartmentDto updateDepartmentDto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (id != updateDepartmentDto.Id)
                    return BadRequest(new { message = "O ID na URL não corresponde ao ID no corpo da requisição." });

                var updatedDepartment = await _departmentService.UpdateAsync(updateDepartmentDto, cancellationToken);
                return Ok(updatedDepartment);
            }
            catch (DepartmentNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:guid}/activate")]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Activate(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _departmentService.ActivateAsync(id, cancellationToken);
                if (result)
                    return Ok(new { message = "Departamento ativado com sucesso." });

                return BadRequest(new { message = "Falha ao ativar o departamento." });
            }
            catch (DepartmentNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:guid}/deactivate")]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _departmentService.DeactivateAsync(id, cancellationToken);
                if (result)
                    return Ok(new { message = "Departamento desativado com sucesso." });

                return BadRequest(new { message = "Falha ao desativar o departamento." });
            }
            catch (DepartmentNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Director")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _departmentService.DeleteAsync(id, cancellationToken);
                if (result)
                    return NoContent();

                return BadRequest(new { message = "Falha ao excluir o departamento." });
            }
            catch (DepartmentNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}