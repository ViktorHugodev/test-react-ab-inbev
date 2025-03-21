using System;

namespace CompanyManager.Application.Exceptions
{
    // Exceção para erros de validação
    public class ValidationException : ApplicationException
    {
        public ValidationException(string message) : base(message)
        {
        }

        public ValidationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    // Exceção para credenciais inválidas
    public class InvalidCredentialsException : ApplicationException
    {
        public InvalidCredentialsException(string message) : base(message)
        {
        }

        public InvalidCredentialsException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    // Exceção para token inválido ou expirado
    public class InvalidTokenException : ApplicationException
    {
        public InvalidTokenException(string message) : base(message)
        {
        }

        public InvalidTokenException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    // Exceção para operações não autorizadas
    public class UnauthorizedOperationException : ApplicationException
    {
        public UnauthorizedOperationException(string message) : base(message)
        {
        }

        public UnauthorizedOperationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
    
    // Exceção para entidade não encontrada para o Departamento
    public class DepartmentNotFoundException : ApplicationException
    {
        public DepartmentNotFoundException(Guid id) 
            : base($"Departamento com ID {id} não encontrado.")
        {
        }
    }
}