using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;

namespace CompanyManager.Application.Interfaces
{
    public interface IEmployeeService
    {
        // Operações de leitura
        Task<EmployeeDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<EmployeeListItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<PagedResultDto<EmployeeListItemDto>> GetPagedAsync(
            int pageNumber, 
            int pageSize, 
            string searchTerm = null,
            string department = null,
            Guid? managerId = null,
            CancellationToken cancellationToken = default);
        
        Task<IEnumerable<EmployeeListItemDto>> GetByDepartmentAsync(
            string department, 
            CancellationToken cancellationToken = default);
        
        Task<IEnumerable<EmployeeListItemDto>> GetByManagerIdAsync(
            Guid managerId, 
            CancellationToken cancellationToken = default);
            
        Task<IEnumerable<EmployeeListItemDto>> GetLeadersAndDirectorsAsync(
            CancellationToken cancellationToken = default);
        
        // Operações de escrita
        Task<EmployeeDto> CreateAsync(
            CreateEmployeeDto createEmployeeDto, 
            CancellationToken cancellationToken = default);
        
        Task<EmployeeDto> UpdateAsync(
            UpdateEmployeeDto updateEmployeeDto, 
            CancellationToken cancellationToken = default);
            
        Task<EmployeeDto> UpdatePartialAsync(
            EmployeePartialUpdateDto partialUpdateDto, 
            CancellationToken cancellationToken = default);
        
        Task<bool> UpdatePasswordAsync(
            UpdatePasswordDto updatePasswordDto, 
            CancellationToken cancellationToken = default);
        
        Task<bool> DeleteAsync(
            Guid id, 
            CancellationToken cancellationToken = default);
        
        // Verificações
        Task<bool> ExistsByEmailAsync(
            string email, 
            CancellationToken cancellationToken = default);
        
        Task<bool> ExistsByDocumentNumberAsync(
            string documentNumber, 
            CancellationToken cancellationToken = default);
    }
}