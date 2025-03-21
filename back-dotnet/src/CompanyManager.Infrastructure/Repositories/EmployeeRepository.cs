using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Interfaces.Repositories;
using CompanyManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CompanyManager.Infrastructure.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly ApplicationDbContext _context;

        public EmployeeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Employee> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers") // Acesso ao campo privado via string
                .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .ToListAsync(cancellationToken);
        }

        public async Task<Employee> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .FirstOrDefaultAsync(e => e.Email == email.ToLower(), cancellationToken);
        }

        public async Task<Employee> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .FirstOrDefaultAsync(e => e.DocumentNumber == documentNumber, cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .Where(e => e.Department == department)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetByManagerIdAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .Where(e => e.ManagerId == managerId)
                .ToListAsync(cancellationToken);
        }

        public async Task<(IEnumerable<Employee> Employees, int Total)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string searchTerm = null,
            string department = null,
            Guid? managerId = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Employees
                .Include(e => e.Manager)
                .Include("_phoneNumbers")
                .AsQueryable();

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(e =>
                    e.FirstName.ToLower().Contains(searchTerm) ||
                    e.LastName.ToLower().Contains(searchTerm) ||
                    e.Email.ToLower().Contains(searchTerm) ||
                    e.DocumentNumber.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(e => e.Department == department);
            }

            if (managerId.HasValue)
            {
                query = query.Where(e => e.ManagerId == managerId);
            }

            // Contar total
            var totalCount = await query.CountAsync(cancellationToken);

            // Aplicar paginação
            var employees = await query
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (employees, totalCount);
        }

        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .AnyAsync(e => e.Email == email.ToLower(), cancellationToken);
        }

        public async Task<bool> ExistsByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
        {
            return await _context.Employees
                .AnyAsync(e => e.DocumentNumber == documentNumber, cancellationToken);
        }

        public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
        {
            await _context.Employees.AddAsync(employee, cancellationToken);
        }

        public Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
        {
            _context.Entry(employee).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default)
        {
            _context.Employees.Remove(employee);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}