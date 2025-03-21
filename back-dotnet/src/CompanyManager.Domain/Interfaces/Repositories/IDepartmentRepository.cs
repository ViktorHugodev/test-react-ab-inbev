using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Department;

namespace CompanyManager.Domain.Interfaces.Repositories
{
    public interface IDepartmentRepository
    {
        Task<Department> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<Department>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<List<Department>> GetActiveAsync(CancellationToken cancellationToken = default);
        Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
        Task AddAsync(Department department, CancellationToken cancellationToken = default);
        void Update(Department department);
        void Remove(Department department);
    }
}