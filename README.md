# Sistema de Gerenciamento de Funcionários

## Descrição do Projeto

Este projeto consiste em uma aplicação para gerenciar funcionários de uma empresa fictícia, desenvolvida como teste técnico para uma vaga de Front-end Senior. A solução completa é composta por uma API REST em .NET 8 (back-end) e uma aplicação em React com Next.js (front-end).

## Requisitos Implementados

### Funcionário
- **Nome e sobrenome** (Obrigatório)
- **E-mail** (Obrigatório)
- **Número do documento** (Único e obrigatório)
- **Telefone** (Suporte a múltiplos números)
- **Gerente** (Referência a outro funcionário)
- **Hierarquia de permissões** (Funcionário < Líder < Diretor)
- **Senha** (Armazenada com hash seguro)
- **Validação de idade mínima** (18 anos)

### Funcionalidades Técnicas
- **API REST em .NET 8**
- **Operações CRUD** completas
- **Banco de dados** SQL Server
- **Front-end** em React com Next.js
- **Documentação da API** via Swagger
- **Testes unitários**
- **Containers/Docker** para toda a solução
- **Banco de dados em Docker**
- **Padrões de projeto** (Design Patterns)
- **Sistema de logs** com Serilog
- **Autenticação JWT**

## Arquitetura e Padrões Utilizados

### Arquitetura Geral

O projeto adota uma arquitetura em camadas seguindo os princípios de Domain-Driven Design (DDD) e Clean Architecture. A separação clara de responsabilidades é uma prioridade, garantindo que cada componente tenha um propósito bem definido.

#### Back-end (.NET 8)

A aplicação back-end está estruturada nas seguintes camadas:

1. **Domain** - Núcleo do negócio
2. **Application** - Orquestração e casos de uso
3. **Infrastructure** - Implementações técnicas 
4. **API** - Interface com o usuário

#### Front-end (Next.js)

O front-end utiliza uma arquitetura baseada em componentes com separação clara entre:

1. **Components** - UI reutilizável 
2. **Services** - Comunicação com a API
3. **Hooks** - Lógica de estado compartilhada
4. **Pages** - Estrutura de rotas e layouts

### Domain-Driven Design (DDD)

O projeto implementa vários conceitos essenciais de DDD:

#### Aggregates
- **Employee**: Aggregate root que gerencia toda lógica relacionada a funcionários
- **Department**: Aggregate para departamentos da empresa

#### Value Objects
- **PhoneNumber**: Encapsula a lógica de validação e representação de números telefônicos

#### Domain Events (implícito)
- Mudanças de estado são tratadas dentro dos aggregates

#### Domain Services
- Lógica de domínio que não pertence naturalmente a um único aggregate

### SOLID no Projeto

O projeto adota os princípios SOLID em diversos pontos:

#### S - Single Responsibility Principle
- Cada classe tem uma única razão para mudar
- Exemplo: `EmployeeService` lida apenas com operações de funcionários

#### O - Open/Closed Principle
- Extensão sem modificação
- Exemplo: Novas validações podem ser adicionadas sem alterar o core

#### L - Liskov Substitution Principle
- Subtypes podem substituir seus types base
- Exemplo: Hierarquia de repositórios e interfaces seguem este princípio

#### I - Interface Segregation Principle
- Interfaces específicas são melhores que uma geral
- Exemplo: `IEmployeeRepository`, `IDepartmentRepository` ao invés de um único `IRepository`

#### D - Dependency Inversion Principle
- Dependência de abstrações, não de implementações
- Exemplo: Controladores dependem de interfaces de serviço, não de implementações concretas

### Padrões de Projeto Utilizados

#### Repository Pattern
- Abstração do acesso a dados
- Permite substituir facilmente a implementação de persistência

#### Unit of Work
- Coordena múltiplas operações em uma única transação
- Garante consistência do banco de dados

#### Factory Method
- Criação de objetos complexos
- Ex: `Employee.Create()` para validação e criação de funcionários

#### Mediator (parcial)
- Reduz acoplamento entre componentes

#### Command Pattern (implícito)
- Representação de operações como objetos
- Ex: DTOs para operações específicas

## Docker e Contêineres

A solução utiliza Docker para os três componentes principais:
- Banco de dados SQL Server
- API .NET 8
- Front-end Next.js

### Execução com Docker Compose

Para executar a aplicação completa usando Docker Compose:

1. Certifique-se de ter o Docker e Docker Compose instalados

2. Clone o repositório e navegue até a pasta raiz do projeto

3. Configure as variáveis de ambiente (opcional, valores padrão são fornecidos)
   ```bash
   # O projeto inclui um arquivo .env com valores padrão
   # Para customizar:
   cp .env .env.local
   # Edite .env.local com suas configurações
   ```

4. Execute o Docker Compose
   ```bash
   docker-compose up -d
   ```

5. Acesse:
   - Front-end: http://localhost:3000
   - API: http://localhost:5000
   - Swagger: http://localhost:5000/swagger

6. Para parar a aplicação:
   ```bash
   docker-compose down
   ```

## Segurança

### Autenticação
- JWT (JSON Web Tokens) para autenticação stateless
- Expiração de tokens configurável
- Armazenamento seguro no front-end com HttpOnly cookies

### Autorização
- RBAC (Role-Based Access Control)
- Hierarquia de permissões (Funcionário < Líder < Diretor)
- Validação em nível de domínio e API

### Senhas
- Hashing de senhas com algoritmos seguros
- Validação de força de senha

## Logging

- Implementação com Serilog
- Logs estruturados
- Captura de exceções e erros
- Rastreamento de operações críticas

## Testes

### Back-end
- Testes de Unidade (domínio, aplicação, API)
- Testes de Integração (API, banco de dados)
- Mocks e stubs para desacoplar dependências

### Front-end
- Testes de componentes React
- Testes de hooks personalizados
- Mocks de API e serviços

## Como Executar o Projeto (Desenvolvimento Local)

Além da execução com Docker, o projeto pode ser executado localmente para desenvolvimento:

### Pré-requisitos
- Docker (para o banco de dados)
- Node.js (versão LTS)
- .NET 8 SDK

### Back-end
```bash
# Inicie apenas o contêiner do banco de dados
docker-compose up -d db

# Navegue até a pasta do back-end
cd back-dotnet

# Restaure pacotes
dotnet restore

# Execute a API
dotnet run --project src/CompanyManager.API/CompanyManager.API.csproj
```

### Front-end
```bash
cd front-next
npm install
npm run dev
```

## Execução de Testes

### Back-end
```bash
cd back-dotnet
dotnet test
```

### Front-end
```bash
cd front-next
npm test
```

## Credenciais Padrão

- **Email**: admin@companymanager.com
- **Senha**: Admin@123
- **Cargo**: Diretor
