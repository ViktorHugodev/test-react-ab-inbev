# Company Manager API

## Docker Setup

This project uses Docker and Docker Compose to run the application and its dependencies.

### Prerequisites

- Docker
- Docker Compose

### Environment Variables

The following environment variables are used in the application:

- `DB_PASSWORD`: Password for the SQL Server database (default: StrongPassword123!)
- `JWT_SECRET`: Secret key for JWT token generation and validation

These variables are defined in the `.env` file.

### Running the Application

1. Start the application and database:

```bash
docker-compose up -d
```

2. The API will be available at http://localhost:5000

3. Swagger documentation is available at http://localhost:5000/swagger

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

## Default User

A default administrator user is created when the database is seeded:



- Email: admin@companymanager.com
- Password: Admin@123
