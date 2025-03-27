# Company Manager System

## Overview
Company Manager is a comprehensive system for managing company departments and employees. It consists of a .NET backend API and a Next.js frontend application that allows users to create, view, update, and delete departments and employees, manage user roles, and view dashboard statistics.

## API Test

There is an *api.http* file in the project root with all the endpoints


## Project Structure

### Backend (.NET)
```
/back-dotnet
├── CompanyManager.sln                # Solution file
├── src/                              # Source code
│   ├── CompanyManager.API/           # API layer with controllers
│   ├── CompanyManager.Application/   # Application services and DTOs
│   ├── CompanyManager.Domain/        # Domain entities and business logic
│   └── CompanyManager.Infrastructure/# Data access and infrastructure services
├── tests/                            # Test projects
│   ├── CompanyManager.UnitTests/     # Unit tests
│   └── CompanyManager.IntegrationTests/# Integration tests
└── docker-compose.yml                # Docker configuration
```

#### Key Components
- **Domain Layer**: Contains business entities like Employee and Department
- **Application Layer**: Contains DTOs and services that implement business logic
- **Infrastructure Layer**: Contains database context, repositories, and migrations
- **API Layer**: Contains controllers and HTTP endpoints

### Key Features
- JWT Authentication and Authorization
- CRUD operations for Departments and Employees
- Role-based access control
- Exception middleware for consistent error handling
- Unit and integration testing

## Running the Application

### Prerequisites
- Docker and Docker Compose
- .NET 8 SDK (for local development)

### Docker Setup
1. Start the application and database:
```bash
docker-compose up -d
```

2. The API will be available at http://localhost:5000
3. Swagger documentation is available at http://localhost:5000/swagger

### Environment Variables
The following environment variables are used in the application:
- `DB_PASSWORD`: Password for the SQL Server database (default: StrongPassword123!)
- `JWT_SECRET`: Secret key for JWT token generation and validation

### Stopping the Application
```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Database Migrations
The application will automatically apply migrations when started in development mode.

## Testing

### Running Backend Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/CompanyManager.UnitTests
dotnet test tests/CompanyManager.IntegrationTests
```

### Test Coverage
The solution includes two test projects:
- **Unit Tests**: Tests individual components in isolation
  - Domain entity tests
  - Service tests
  - Controller tests
  - Authorization filter tests
- **Integration Tests**: Tests API endpoints with a test database
  - Authentication/Authorization
  - Department management
  - Employee management

## Architecture Design

The backend follows Clean Architecture principles:
- **Domain-Driven Design**: Core business logic in the domain layer
- **Repository Pattern**: Abstraction over data access
- **Unit of Work**: Transaction management
- **CQRS-inspired**: Separation of command and query models
- **Value Objects**: For encapsulating domain concepts like PhoneNumber

## Default User
A default administrator user is created when the database is seeded:
- Email: admin@companymanager.com
- Password: Admin@123