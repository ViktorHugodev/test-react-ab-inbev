using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Employee;

namespace CompanyManager.Domain.Interfaces.Repositories
{
    public interface IEmployeeRepository
    {
        // Operações de leitura
        Task<Employee> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Employee> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<Employee> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<Employee>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default);
        Task<IEnumerable<Employee>> GetByManagerIdAsync(Guid managerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Employee>> GetByRolesAsync(IEnumerable<Enums.Role> roles, CancellationToken cancellationToken = default);
        
        // Paginação
        Task<(IEnumerable<Employee> Employees, int Total)> GetPagedAsync(
            int pageNumber, 
            int pageSize, 
            string searchTerm = null,
            string department = null,
            Guid? managerId = null,
            CancellationToken cancellationToken = default);
        
        // Verificações
        Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> ExistsByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);
        
        // Operações de escrita
        Task AddAsync(Employee employee, CancellationToken cancellationToken = default);
        Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default);
        Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default);
        
        // Unit of Work
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}