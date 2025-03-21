using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Department;
using CompanyManager.Domain.Interfaces.Repositories;
using CompanyManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CompanyManager.Infrastructure.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly ApplicationDbContext _context;

        public DepartmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Department> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        }

        public async Task<List<Department>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Departments
                .OrderBy(d => d.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Department>> GetActiveAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
        {
            return await _context.Departments
                .AnyAsync(d => d.Name.ToLower() == name.ToLower(), cancellationToken);
        }

        public async Task AddAsync(Department department, CancellationToken cancellationToken = default)
        {
            await _context.Departments.AddAsync(department, cancellationToken);
        }

        public void Update(Department department)
        {
            _context.Departments.Update(department);
        }

        public void Remove(Department department)
        {
            _context.Departments.Remove(department);
        }
    }
}