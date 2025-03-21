using System;

namespace CompanyManager.Domain.Exceptions
{
    public class DomainException : Exception
    {
        public DomainException(string message) : base(message)
        {
        }

        public DomainException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    public class EntityNotFoundException : DomainException
    {
        public EntityNotFoundException(string entityName, string identifier) 
            : base($"{entityName} com identificador {identifier} não foi encontrado.")
        {
        }
    }

    public class DuplicateEntityException : DomainException
    {
        public DuplicateEntityException(string message) : base(message)
        {
        }
    }

    public class InsufficientPermissionException : DomainException
    {
        public InsufficientPermissionException() 
            : base("Você não tem permissão para realizar esta operação.")
        {
        }

        public InsufficientPermissionException(string message) 
            : base(message)
        {
        }
    }
}