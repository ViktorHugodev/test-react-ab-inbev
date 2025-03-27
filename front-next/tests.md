# Guia de Testes Unitários no Projeto

## Introdução

Este documento fornece uma visão geral sobre os testes unitários no projeto, utilizando Jest e React Testing Library. Os testes unitários garantem que componentes individuais funcionem conforme esperado, reduzindo bugs e facilitando a manutenção do código.

## Bibliotecas Utilizadas

- **Jest**: Framework de testes JavaScript com foco em simplicidade
- **React Testing Library**: Biblioteca para testar componentes React de forma mais próxima à experiência do usuário
- **userEvent**: Simula interações do usuário de forma mais realista que fireEvent
- **MSW (Mock Service Worker)**: Intercepta requisições de rede para simular respostas da API

## Estrutura dos Testes

Os testes seguem a estrutura:

```
src/
  __tests__/
    components/         # Testes de componentes React
    hooks/              # Testes de hooks personalizados 
    lib/                # Testes de funções utilitárias
    e2e/                # Testes end-to-end (opcionais)
```

## Como os Testes Funcionam

### 1. Renderização de Componentes

Usamos a função `render` da React Testing Library para montar componentes no DOM:

```javascript
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/features/authentication/login-form';

it('should render the login form correctly', () => {
  render(<LoginForm />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
```

### 2. Simulando Interações do Usuário

Utilizamos `userEvent` para simular ações do usuário:

```javascript
import userEvent from '@testing-library/user-event';

it('should call login function when form is submitted', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/senha/i), 'password123');
  await user.click(screen.getByRole('button', { name: /entrar/i }));
  
  expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
});
```

### 3. Mocks

Utilizamos Jest para mockar módulos, funções e hooks:

```javascript
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Configurando o mock antes do teste
useAuth.mockReturnValue({
  login: mockLogin,
  isLoading: false,
  user: null,
});
```

### 4. Asserções

Usamos asserções para verificar o comportamento esperado:

```javascript
// Verificar se elementos estão presentes
expect(screen.getByText(/login/i)).toBeInTheDocument();

// Verificar se funções foram chamadas
expect(mockLogin).toHaveBeenCalledWith('teste@email.com', 'senha123');

// Verificar estado dos elementos
expect(button).toBeDisabled();
expect(input).toHaveValue('texto digitado');
```

## Escrevendo Novos Testes

### Guia Passo a Passo

1. **Crie o arquivo de teste**: Nomeie como `nome-do-componente.test.tsx` no diretório correspondente em `__tests__`
2. **Importe as dependências**:
   ```javascript
   import { render, screen, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { ComponenteATestar } from '@/path/to/component';
   ```
3. **Mocke as dependências externas**:
   ```javascript
   jest.mock('@/hooks/algum-hook', () => ({
     useAlgumHook: jest.fn()
   }));
   
   // Configure o mock antes de cada teste
   beforeEach(() => {
     useAlgumHook.mockReturnValue({...});
   });
   ```
4. **Escreva os casos de teste**: Use a estrutura `it('descrição do teste', () => {...})`
5. **Execute os testes**: `npm test` ou `npm test -- -t "nome do teste"`

### Testando Componentes com Providers

Use o utilitário `renderWithProviders` de `src/test/utils/test-utils.tsx`:

```javascript
import { renderWithProviders } from '@/test/utils/test-utils';

it('should render component with auth provider', () => {
  renderWithProviders(<MeuComponente />, { mockRole: EmployeeRole.Leader });
  // Asserções
});
```

## Dicas de Debugging

1. **Usando debug()**: Para visualizar o DOM renderizado
   ```javascript
   render(<MeuComponente />);
   screen.debug();
   ```
   
2. **Isolando testes**: Execute um teste específico com
   ```
   npm test -- -t "nome do teste"
   ```
   
3. **Verificando elementos**:
   - Se um elemento não está sendo encontrado, tente queries mais flexíveis:
     ```javascript
     screen.getByText(/parte do texto/i) // Case insensitive
     screen.queryByRole('button') // Retorna null em vez de erro se não encontrar
     screen.findByLabelText('Email') // Assíncrono, espera o elemento aparecer
     ```

4. **Vendo mocks chamados**:
   ```javascript
   console.log(mockFunction.mock.calls);
   ```

## Correção de Problemas Comuns

1. **Elemento não encontrado**: Verifique se está usando o seletor correto. Use `screen.debug()` para ver o DOM atual.

2. **Asserções assíncronas**: Use `waitFor` ou `findBy*` para elementos que mudam após ações assíncronas:
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Sucesso')).toBeInTheDocument();
   });
   ```

3. **Mock não chamado**: Verifique se o mock está configurado corretamente e se a função é realmente chamada no código.

4. **Erros com userEvent**: Lembre-se que `userEvent` é assíncrono:
   ```javascript
   // Correto
   await user.click(button);
   
   // Incorreto
   user.click(button); // Sem await
   ```

   