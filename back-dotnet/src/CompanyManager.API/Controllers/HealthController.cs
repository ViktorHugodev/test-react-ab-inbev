using System;
using System.Threading;
using System.Threading.Tasks;
using CompanyManager.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CompanyManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<HealthController> _logger;

        public HealthController(
            ApplicationDbContext dbContext,
            ILogger<HealthController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public async Task<ActionResult<HealthResponse>> Get(CancellationToken cancellationToken)
        {
            var response = new HealthResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = GetType().Assembly.GetName().Version?.ToString() ?? "1.0.0",
                Checks = new HealthChecks
                {
                    Database = new CheckResult { Status = "Checking..." }
                }
            };

            try
            {
                // Verifica conexão com o banco de dados
                await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
                response.Checks.Database.Status = "Healthy";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha na conexão com o banco de dados durante health check");
                response.Status = "Unhealthy";
                response.Checks.Database.Status = "Unhealthy";
                response.Checks.Database.Error = ex.Message;
                return StatusCode(StatusCodes.Status503ServiceUnavailable, response);
            }

            return Ok(response);
        }

        public class HealthResponse
        {
            public string Status { get; set; }
            public DateTime Timestamp { get; set; }
            public string Version { get; set; }
            public HealthChecks Checks { get; set; }
        }

        public class HealthChecks
        {
            public CheckResult Database { get; set; }
        }

        public class CheckResult
        {
            public string Status { get; set; }
            public string Error { get; set; }
        }
    }
}