using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;

namespace CompanyManager.Application.Interfaces
{
    public interface IDepartmentService
    {
        Task<List<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<List<DepartmentDto>> GetActiveAsync(CancellationToken cancellationToken = default);
        Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDepartmentDto, CancellationToken cancellationToken = default);
        Task<DepartmentDto> UpdateAsync(UpdateDepartmentDto updateDepartmentDto, CancellationToken cancellationToken = default);
        Task<bool> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}