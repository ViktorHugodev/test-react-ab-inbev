# Front-End AB InBev - Aplicação Next.js

Este projeto é um exemplo de interface de login criada com Next.js, TypeScript, Tailwind CSS e ShadcnUI.

## Recursos

- Formulário de login com validações
- Feedback visual com toasts de erro/sucesso
- Interface responsiva com ShadcnUI
- Validação com Zod + React Hook Form
- Simulação de API para testes

## Estrutura de Pastas

```
src/
├── app/                 # Rotas e layouts da aplicação
├── components/
│   ├── forms/           # Componentes de formulários
│   └── ui/              # Componentes de UI (ShadcnUI)
├── hooks/               # Custom hooks
├── lib/
│   ├── api/             # Serviços de API
│   ├── utils.ts         # Funções utilitárias
│   └── validations/     # Esquemas de validação
└── types/               # Definições de tipos
```

## Credenciais para Teste

- Email: admin@companymanager.com
- Senha: Admin@123

## Começando

Para executar o projeto localmente:

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000 no seu navegador.

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- ShadcnUI
- React Hook Form
- Zod
- Sonner (para toasts)