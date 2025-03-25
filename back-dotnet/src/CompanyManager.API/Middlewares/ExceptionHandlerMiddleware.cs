using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using CompanyManager.Application.Exceptions;
using CompanyManager.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CompanyManager.API.Middlewares
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlerMiddleware> _logger;

        public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro não tratado: {ErrorMessage}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var (statusCode, message) = GetStatusCodeAndMessage(exception);
            
            context.Response.StatusCode = (int)statusCode;
            
            // Incluir detalhes técnicos para melhor depuração
            string detailedMessage = exception.ToString();
            
            var result = JsonSerializer.Serialize(new { 
                message = message,
                details = detailedMessage
            });
            await context.Response.WriteAsync(result);
        }

        private static (HttpStatusCode StatusCode, string Message) GetStatusCodeAndMessage(Exception exception)
        {
            return exception switch
            {
                EntityNotFoundException _ => (HttpStatusCode.NotFound, exception.Message),
                DuplicateEntityException _ => (HttpStatusCode.Conflict, exception.Message),
                InsufficientPermissionException _ => (HttpStatusCode.Forbidden, exception.Message),
                DomainException _ => (HttpStatusCode.BadRequest, exception.Message),
                ValidationException _ => (HttpStatusCode.BadRequest, exception.Message),
                InvalidCredentialsException _ => (HttpStatusCode.Unauthorized, exception.Message),
                InvalidTokenException _ => (HttpStatusCode.Unauthorized, exception.Message),
                UnauthorizedOperationException _ => (HttpStatusCode.Forbidden, exception.Message),
                ApplicationException _ => (HttpStatusCode.BadRequest, exception.Message),
                DbUpdateConcurrencyException _ => (HttpStatusCode.Conflict, "Erro de concorrência: Os dados foram modificados por outro usuário. Por favor, recarregue e tente novamente."),
                _ => (HttpStatusCode.InternalServerError, "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.")
            };
        }
    }
}