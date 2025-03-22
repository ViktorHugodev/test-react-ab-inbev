// Importar Jest DOM para estender os matchers do Jest
import '@testing-library/jest-dom';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
}));

// Mock do localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock do sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Configuração do MSW para interceptar requisições durante os testes
import { server } from './src/test/mocks/server';

// Iniciar o servidor antes de todos os testes
beforeAll(() => server.listen());

// Resetar os handlers entre os testes
afterEach(() => server.resetHandlers());

// Fechar o servidor depois de todos os testes
afterAll(() => server.close());

// Silenciar os warnings do console durante os testes
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock TextEncoder/TextDecoder for Node environments
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
