using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using CompanyManager.Application.DTOs;
using CompanyManager.Application.Exceptions;
using CompanyManager.Application.Interfaces;
using CompanyManager.Domain.Aggregates.Employee;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CompanyManager.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthService _authService;
        private readonly ILogger<EmployeeService> _logger;

        public EmployeeService(
            IUnitOfWork unitOfWork,
            IAuthService authService,
            ILogger<EmployeeService> logger)
        {
            _unitOfWork = unitOfWork;
            _authService = authService;
            _logger = logger;
        }

        public async Task<EmployeeDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var employee = await _unitOfWork.Employees.GetByIdAsync(id, cancellationToken);
            if (employee == null)
                throw new EntityNotFoundException("Funcionário", id.ToString());

            return MapToEmployeeDto(employee);
        }

        public async Task<IEnumerable<EmployeeListItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var employees = await _unitOfWork.Employees.GetAllAsync(cancellationToken);
            return employees.Select(MapToEmployeeListItemDto).ToList();
        }

        public async Task<PagedResultDto<EmployeeListItemDto>> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string searchTerm = null,
            string department = null,
            Guid? managerId = null,
            CancellationToken cancellationToken = default)
        {
            var (employees, totalCount) = await _unitOfWork.Employees.GetPagedAsync(
                pageNumber,
                pageSize,
                searchTerm,
                department,
                managerId,
                cancellationToken);

            var items = employees.Select(MapToEmployeeListItemDto).ToList();

            return new PagedResultDto<EmployeeListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<IEnumerable<EmployeeListItemDto>> GetByDepartmentAsync(
            string department,
            CancellationToken cancellationToken = default)
        {
            var employees = await _unitOfWork.Employees.GetByDepartmentAsync(department, cancellationToken);
            return employees.Select(MapToEmployeeListItemDto).ToList();
        }

        public async Task<IEnumerable<EmployeeListItemDto>> GetByManagerIdAsync(
            Guid managerId,
            CancellationToken cancellationToken = default)
        {
            var employees = await _unitOfWork.Employees.GetByManagerIdAsync(managerId, cancellationToken);
            return employees.Select(MapToEmployeeListItemDto).ToList();
        }
        
        public async Task<IEnumerable<EmployeeListItemDto>> GetLeadersAndDirectorsAsync(
            CancellationToken cancellationToken = default)
        {
            var roles = new List<Role> { Role.Leader, Role.Director };
            var employees = await _unitOfWork.Employees.GetByRolesAsync(roles, cancellationToken);
            return employees.Select(MapToEmployeeListItemDto).ToList();
        }

        public async Task<EmployeeDto> CreateAsync(
            CreateEmployeeDto createEmployeeDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Verificações de unicidade
                if (await _unitOfWork.Employees.ExistsByEmailAsync(createEmployeeDto.Email, cancellationToken))
                    throw new DuplicateEntityException($"Já existe um funcionário com o e-mail '{createEmployeeDto.Email}'.");

                if (await _unitOfWork.Employees.ExistsByDocumentNumberAsync(createEmployeeDto.DocumentNumber, cancellationToken))
                    throw new DuplicateEntityException($"Já existe um funcionário com o documento '{createEmployeeDto.DocumentNumber}'.");

                // Verificações de gerente
                Employee manager = null;
                if (createEmployeeDto.ManagerId.HasValue)
                {
                    manager = await _unitOfWork.Employees.GetByIdAsync(createEmployeeDto.ManagerId.Value, cancellationToken);
                    if (manager == null)
                        throw new EntityNotFoundException("Gerente", createEmployeeDto.ManagerId.Value.ToString());

                    // Verifica se o gerente tem permissão para gerenciar funcionários com este cargo
                    if (!manager.CanManage(createEmployeeDto.Role))
                        throw new InsufficientPermissionException(
                            $"Um {manager.Role} não pode gerenciar um {createEmployeeDto.Role}.");
                }

                // Hash da senha
                var passwordHash = _authService.HashPassword(createEmployeeDto.Password);

                // Criação do funcionário
                var employee = Employee.Create(
                    createEmployeeDto.FirstName,
                    createEmployeeDto.LastName,
                    createEmployeeDto.Email,
                    createEmployeeDto.DocumentNumber,
                    createEmployeeDto.BirthDate,
                    passwordHash,
                    createEmployeeDto.Role,
                    createEmployeeDto.Department,
                    createEmployeeDto.ManagerId);

                // Adiciona os telefones
                if (createEmployeeDto.PhoneNumbers != null)
                {
                    foreach (var phoneDto in createEmployeeDto.PhoneNumbers)
                    {
                        employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                    }
                }

                // Persistência
                await _unitOfWork.Employees.AddAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Funcionário criado com sucesso: {EmployeeId} - {EmployeeName}",
                    employee.Id, employee.FullName);

                return MapToEmployeeDto(employee);
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao criar funcionário: {ErrorMessage}", ex.Message);
                throw new ApplicationException("Ocorreu um erro ao criar o funcionário. Por favor, tente novamente.", ex);
            }
        }

        public async Task<EmployeeDto> UpdateAsync(
            UpdateEmployeeDto updateEmployeeDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(updateEmployeeDto.Id, cancellationToken);
                if (employee == null)
                    throw new EntityNotFoundException("Funcionário", updateEmployeeDto.Id.ToString());

                // Verifica se o e-mail foi alterado e se já existe
                if (updateEmployeeDto.Email != null && employee.Email != updateEmployeeDto.Email &&
                    await _unitOfWork.Employees.ExistsByEmailAsync(updateEmployeeDto.Email, cancellationToken))
                {
                    throw new DuplicateEntityException($"Já existe um funcionário com o e-mail '{updateEmployeeDto.Email}'.");
                }

                // Verificações de gerente
                if (updateEmployeeDto.ManagerId.HasValue)
                {
                    // Não permitir ciclos na hierarquia
                    if (updateEmployeeDto.ManagerId == employee.Id)
                        throw new DomainException("Um funcionário não pode ser gerente de si mesmo.");

                    var manager = await _unitOfWork.Employees.GetByIdAsync(updateEmployeeDto.ManagerId.Value, cancellationToken);
                    if (manager == null)
                        throw new EntityNotFoundException("Gerente", updateEmployeeDto.ManagerId.Value.ToString());

                    // Verifica se o gerente tem permissão para gerenciar funcionários com este cargo
                    var role = updateEmployeeDto.Role ?? employee.Role;
                    if (!manager.CanManage(role))
                        throw new InsufficientPermissionException(
                            $"Um {manager.Role} não pode gerenciar um {role}.");
                }

                // Atualiza dados básicos de forma parcial
                employee.UpdatePartial(
                    updateEmployeeDto.FirstName,
                    updateEmployeeDto.LastName,
                    updateEmployeeDto.Email,
                    updateEmployeeDto.BirthDate,
                    updateEmployeeDto.Role,
                    updateEmployeeDto.Department,
                    updateEmployeeDto.ManagerId);

                // Atualização de telefones, apenas se foram fornecidos
                if (updateEmployeeDto.PhoneNumbers != null)
                {
                    var phoneList = employee.PhoneNumbers.ToList();
                    
                    // Rastreie quais telefones foram processados para saber quais remover depois
                    var processedPhoneIds = new List<Guid>();
                    
                    // Atualiza ou adiciona telefones
                    foreach (var phoneDto in updateEmployeeDto.PhoneNumbers)
                    {
                        // Se o telefone tiver ID, atualize o existente
                        if (phoneDto.Id.HasValue && phoneDto.Id.Value != Guid.Empty)
                        {
                            var existingPhone = phoneList.FirstOrDefault(p => p.Id == phoneDto.Id.Value);
                            if (existingPhone != null)
                            {
                                // Marca como processado
                                processedPhoneIds.Add(existingPhone.Id);
                                
                                // Para atualizar um telefone existente, removemos e adicionamos um novo
                                // (já que PhoneNumber é um Value Object imutável)
                                employee.RemovePhoneNumber(existingPhone.Id);
                                employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                                continue;
                            }
                        }
                        
                        // Se não tiver ID ou não encontrar o telefone, adiciona um novo
                        employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                    }
                    
                    // Remove telefones que não foram processados (não estavam no DTO)
                    foreach (var phone in phoneList)
                    {
                        if (!processedPhoneIds.Contains(phone.Id))
                        {
                            employee.RemovePhoneNumber(phone.Id);
                        }
                    }
                }

                // Persistência
                await _unitOfWork.Employees.UpdateAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Funcionário atualizado com sucesso: {EmployeeId} - {EmployeeName}",
                    employee.Id, employee.FullName);

                return MapToEmployeeDto(employee);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Erro de concorrência ao atualizar funcionário ID {EmployeeId}: {ErrorMessage}", 
                    updateEmployeeDto.Id, ex.Message);
                throw new ApplicationException("Erro de concorrência: Os dados foram modificados por outro usuário. Por favor, recarregue e tente novamente.", ex);
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao atualizar funcionário ID {EmployeeId}: {ErrorMessage}", 
                    updateEmployeeDto.Id, ex.Message);
                throw new ApplicationException("Ocorreu um erro ao atualizar o funcionário. Por favor, tente novamente.", ex);
            }
        }

        public async Task<bool> UpdatePasswordAsync(
            UpdatePasswordDto updatePasswordDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(updatePasswordDto.EmployeeId, cancellationToken);
                if (employee == null)
                    throw new EntityNotFoundException("Funcionário", updatePasswordDto.EmployeeId.ToString());

                // Verifica se a senha atual está correta
                if (!_authService.VerifyPasswordAsync(employee.Email, updatePasswordDto.CurrentPassword, cancellationToken).Result)
                    throw new InvalidCredentialsException("A senha atual está incorreta.");

                // Verifica se a nova senha e a confirmação são iguais
                if (updatePasswordDto.NewPassword != updatePasswordDto.ConfirmNewPassword)
                    throw new ValidationException("A nova senha e a confirmação não coincidem.");

                // Hash da nova senha
                var newPasswordHash = _authService.HashPassword(updatePasswordDto.NewPassword);

                // Atualiza a senha
                employee.UpdatePassword(newPasswordHash);

                // Persistência
                await _unitOfWork.Employees.UpdateAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Senha atualizada com sucesso para o funcionário: {EmployeeId}", employee.Id);

                return true;
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao atualizar senha: {ErrorMessage}", ex.Message);
                throw new ApplicationException("Ocorreu um erro ao atualizar a senha. Por favor, tente novamente.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(id, cancellationToken);
                if (employee == null)
                    throw new EntityNotFoundException("Funcionário", id.ToString());

                // Verifica se há subordinados
                var subordinates = await _unitOfWork.Employees.GetByManagerIdAsync(id, cancellationToken);
                if (subordinates.Any())
                    throw new DomainException(
                        "Este funcionário não pode ser excluído pois existem outros funcionários subordinados a ele.");

                // Exclusão
                await _unitOfWork.Employees.DeleteAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Funcionário excluído com sucesso: {EmployeeId} - {EmployeeName}",
                    employee.Id, employee.FullName);

                return true;
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao excluir funcionário: {ErrorMessage}", ex.Message);
                throw new ApplicationException("Ocorreu um erro ao excluir o funcionário. Por favor, tente novamente.", ex);
            }
        }

        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _unitOfWork.Employees.ExistsByEmailAsync(email, cancellationToken);
        }

        public async Task<bool> ExistsByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
        {
            return await _unitOfWork.Employees.ExistsByDocumentNumberAsync(documentNumber, cancellationToken);
        }
        
        public async Task<EmployeeDto> UpdatePhoneNumbersAsync(
            UpdatePhoneNumbersDto updatePhoneNumbersDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(updatePhoneNumbersDto.Id, cancellationToken);
                if (employee == null)
                    throw new EntityNotFoundException("Funcionário", updatePhoneNumbersDto.Id.ToString());

                // Limpa os telefones existentes e adiciona os novos
                var existingPhones = employee.PhoneNumbers.ToList();
                foreach (var phone in existingPhones)
                {
                    employee.RemovePhoneNumber(phone.Id);
                }

                // Adiciona os novos telefones
                foreach (var phoneDto in updatePhoneNumbersDto.PhoneNumbers)
                {
                    employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                }

                // Persistência
                await _unitOfWork.Employees.UpdateAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Números de telefone atualizados com sucesso para o funcionário: {EmployeeId} - {EmployeeName}",
                    employee.Id, employee.FullName);

                return MapToEmployeeDto(employee);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Erro de concorrência ao atualizar telefones do funcionário ID {EmployeeId}: {ErrorMessage}", 
                    updatePhoneNumbersDto.Id, ex.Message);
                throw new ApplicationException("Erro de concorrência: Os dados foram modificados por outro usuário. Por favor, recarregue e tente novamente.", ex);
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao atualizar telefones do funcionário ID {EmployeeId}: {ErrorMessage}", 
                    updatePhoneNumbersDto.Id, ex.Message);
                throw new ApplicationException("Ocorreu um erro ao atualizar os telefones do funcionário. Por favor, tente novamente.", ex);
            }
        }

        public async Task<EmployeeDto> UpdatePartialAsync(
            EmployeePartialUpdateDto partialUpdateDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(partialUpdateDto.Id, cancellationToken);
                if (employee == null)
                    throw new EntityNotFoundException("Funcionário", partialUpdateDto.Id.ToString());

                // Verifica se o e-mail foi alterado e se já existe
                if (partialUpdateDto.Email != null && employee.Email != partialUpdateDto.Email &&
                    await _unitOfWork.Employees.ExistsByEmailAsync(partialUpdateDto.Email, cancellationToken))
                {
                    throw new DuplicateEntityException($"Já existe um funcionário com o e-mail '{partialUpdateDto.Email}'.");
                }

                // Verificações de gerente apenas se o campo ManagerId foi fornecido
                if (partialUpdateDto.ManagerId != null)
                {
                    // Não permitir ciclos na hierarquia
                    if (partialUpdateDto.ManagerId == employee.Id)
                        throw new DomainException("Um funcionário não pode ser gerente de si mesmo.");

                    // Verificar se o gerente existe
                    if (partialUpdateDto.ManagerId.Value != Guid.Empty)
                    {
                        var manager = await _unitOfWork.Employees.GetByIdAsync(partialUpdateDto.ManagerId.Value, cancellationToken);
                        if (manager == null)
                            throw new EntityNotFoundException("Gerente", partialUpdateDto.ManagerId.Value.ToString());

                        // Verifica se o gerente tem permissão para gerenciar funcionários com este cargo
                        var role = partialUpdateDto.Role ?? employee.Role;
                        if (!manager.CanManage(role))
                            throw new InsufficientPermissionException(
                                $"Um {manager.Role} não pode gerenciar um {role}.");
                    }
                }

                // Atualiza dados básicos com método parcial
                employee.UpdatePartial(
                    partialUpdateDto.FirstName,
                    partialUpdateDto.LastName,
                    partialUpdateDto.Email,
                    partialUpdateDto.BirthDate,
                    partialUpdateDto.Role,
                    partialUpdateDto.Department,
                    partialUpdateDto.ManagerId);

                // Atualiza telefones se fornecidos
                if (partialUpdateDto.PhoneNumbers != null)
                {
                    var phoneList = employee.PhoneNumbers.ToList();
                    
                    // Rastreia quais telefones foram processados para saber quais remover depois
                    var processedPhoneIds = new List<Guid>();
                    
                    // Atualiza ou adiciona telefones
                    foreach (var phoneDto in partialUpdateDto.PhoneNumbers)
                    {
                        // Se o telefone tiver ID, atualize o existente
                        if (phoneDto.Id.HasValue && phoneDto.Id.Value != Guid.Empty)
                        {
                            var existingPhone = phoneList.FirstOrDefault(p => p.Id == phoneDto.Id.Value);
                            if (existingPhone != null)
                            {
                                // Marca como processado
                                processedPhoneIds.Add(existingPhone.Id);
                                
                                // Para atualizar um telefone existente, removemos e adicionamos um novo
                                // (já que PhoneNumber é um Value Object imutável)
                                employee.RemovePhoneNumber(existingPhone.Id);
                                employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                                continue;
                            }
                        }
                        
                        // Se não tiver ID ou não encontrar o telefone, adiciona um novo
                        employee.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
                    }
                    
                    // Remove telefones que não foram processados (não estavam no DTO)
                    foreach (var phone in phoneList)
                    {
                        if (!processedPhoneIds.Contains(phone.Id))
                        {
                            employee.RemovePhoneNumber(phone.Id);
                        }
                    }
                }

                // Persistência
                await _unitOfWork.Employees.UpdateAsync(employee, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Funcionário atualizado parcialmente com sucesso: {EmployeeId} - {EmployeeName}",
                    employee.Id, employee.FullName);

                return MapToEmployeeDto(employee);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Erro de concorrência ao atualizar funcionário ID {EmployeeId}: {ErrorMessage}", 
                    partialUpdateDto.Id, ex.Message);
                throw new ApplicationException("Erro de concorrência: Os dados foram modificados por outro usuário. Por favor, recarregue e tente novamente.", ex);
            }
            catch (Exception ex) when (ex is not ApplicationException && ex is not DomainException)
            {
                _logger.LogError(ex, "Erro ao atualizar funcionário ID {EmployeeId}: {ErrorMessage}", 
                    partialUpdateDto.Id, ex.Message);
                throw new ApplicationException("Ocorreu um erro ao atualizar o funcionário. Por favor, tente novamente.", ex);
            }
        }

        // Métodos auxiliares para mapeamento de entidades para DTOs
        private EmployeeDto MapToEmployeeDto(Employee employee)
        {
            return new EmployeeDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                DocumentNumber = employee.DocumentNumber,
                BirthDate = employee.BirthDate,
                Age = CalculateAge(employee.BirthDate),
                Role = employee.Role,
                Department = employee.Department,
                ManagerId = employee.ManagerId,
                ManagerName = employee.Manager?.FullName,
                PhoneNumbers = employee.PhoneNumbers.Select(p => new PhoneNumberDto
                {
                    Id = p.Id,
                    Number = p.Number,
                    Type = p.Type
                }).ToList(),
                CreatedAt = employee.CreatedAt,
                UpdatedAt = employee.UpdatedAt
            };
        }

        private EmployeeListItemDto MapToEmployeeListItemDto(Employee employee)
        {
            return new EmployeeListItemDto
            {
                Id = employee.Id,
                FullName = employee.FullName,
                Email = employee.Email,
                Department = employee.Department,
                Role = employee.Role,
                ManagerName = employee.Manager?.FullName
            };
        }

        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}