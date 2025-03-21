using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CompanyManager.Application.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(
            IUnitOfWork unitOfWork,
            ILogger<DepartmentService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<List<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var departments = await _unitOfWork.Departments.GetAllAsync(cancellationToken);
                return departments.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter todos os departamentos");
                throw;
            }
        }

        public async Task<List<DepartmentDto>> GetActiveAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var departments = await _unitOfWork.Departments.GetActiveAsync(cancellationToken);
                return departments.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter departamentos ativos");
                throw;
            }
        }

        public async Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var department = await _unitOfWork.Departments.GetByIdAsync(id, cancellationToken);
                if (department == null)
                {
                    throw new DepartmentNotFoundException(id);
                }

                return MapToDto(department);
            }
            catch (DepartmentNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter departamento por ID {DepartmentId}", id);
                throw;
            }
        }

        public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDepartmentDto, CancellationToken cancellationToken = default)
        {
            try
            {
                // Verifica se já existe um departamento com o mesmo nome
                var exists = await _unitOfWork.Departments.ExistsByNameAsync(createDepartmentDto.Name, cancellationToken);
                if (exists)
                {
                    throw new ValidationException($"Já existe um departamento com o nome '{createDepartmentDto.Name}'.");
                }

                // Cria o departamento usando o factory method
                var department = Department.Create(
                    createDepartmentDto.Name,
                    createDepartmentDto.Description
                );

                // Adiciona ao repositório
                await _unitOfWork.Departments.AddAsync(department, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return MapToDto(department);
            }
            catch (DomainException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao criar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao criar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<DepartmentDto> UpdateAsync(UpdateDepartmentDto updateDepartmentDto, CancellationToken cancellationToken = default)
        {
            try
            {
                // Obtém o departamento pelo ID
                var department = await _unitOfWork.Departments.GetByIdAsync(updateDepartmentDto.Id, cancellationToken);
                if (department == null)
                {
                    throw new DepartmentNotFoundException(updateDepartmentDto.Id);
                }

                // Verifica se já existe outro departamento com o mesmo nome
                var departments = await _unitOfWork.Departments.GetAllAsync(cancellationToken);
                var existingWithSameName = departments
                    .FirstOrDefault(d => d.Id != updateDepartmentDto.Id && 
                                    d.Name.ToLower() == updateDepartmentDto.Name.ToLower());
                
                if (existingWithSameName != null)
                {
                    throw new ValidationException($"Já existe outro departamento com o nome '{updateDepartmentDto.Name}'.");
                }

                // Atualiza o departamento
                department.Update(
                    updateDepartmentDto.Name,
                    updateDepartmentDto.Description
                );

                // Salva as alterações
                _unitOfWork.Departments.Update(department);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return MapToDto(department);
            }
            catch (DepartmentNotFoundException)
            {
                throw;
            }
            catch (DomainException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao atualizar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao atualizar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar departamento: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<bool> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var department = await _unitOfWork.Departments.GetByIdAsync(id, cancellationToken);
                if (department == null)
                {
                    throw new DepartmentNotFoundException(id);
                }

                department.Activate();
                _unitOfWork.Departments.Update(department);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (DepartmentNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao ativar departamento: {ErrorMessage}", ex.Message);
                return false;
            }
        }

        public async Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var department = await _unitOfWork.Departments.GetByIdAsync(id, cancellationToken);
                if (department == null)
                {
                    throw new DepartmentNotFoundException(id);
                }

                department.Deactivate();
                _unitOfWork.Departments.Update(department);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (DepartmentNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao desativar departamento: {ErrorMessage}", ex.Message);
                return false;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var department = await _unitOfWork.Departments.GetByIdAsync(id, cancellationToken);
                if (department == null)
                {
                    throw new DepartmentNotFoundException(id);
                }

                // Verifica se existem funcionários no departamento (opcional)
                // ...

                _unitOfWork.Departments.Remove(department);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (DepartmentNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir departamento: {ErrorMessage}", ex.Message);
                return false;
            }
        }

        // Método auxiliar para mapear entidade para DTO
        private static DepartmentDto MapToDto(Department department)
        {
            return new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }
    }
}