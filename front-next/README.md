# Sistema de Gerenciamento de Funcionários - AB InBev

Uma aplicação moderna para gerenciamento de funcionários e departamentos, desenvolvida com React, Next.js, TypeScript e diversas tecnologias modernas.

## 🚀 Tecnologias Utilizadas

- **Framework Frontend**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Gerenciamento de Estado**: Redux Toolkit
- **API & Data Fetching**: TanStack Query (React Query)
- **Formulários**: React Hook Form com Zod para validação
- **Autenticação**: Token JWT com gerenciamento integrado

## ✨ Destaques do Projeto

### Arquitetura Moderna

- Utilização de App Router do Next.js
- Clean Architecture com separação clara de responsabilidades
- Código estruturado seguindo padrões recomendados pela comunidade

### Padrões de Design Implementados

- **Container/Presentation Pattern**: Separação de lógica e UI
- **Provider Pattern**: Compartilhamento de estado e funcionalidades
- **Custom Hooks Pattern**: Reutilização de lógica
- **Compound Components**: Flexibilidade e coesão visual
- **Factory Pattern**: Criação dinâmica de componentes
- **Adapter Pattern**: Para compatibilidade de APIs
- **Singleton Pattern**: Para serviços globais
- **Observer Pattern**: Para atualizações reativas

### Gerenciamento de Estado com Redux Toolkit

A aplicação utiliza Redux Toolkit para gerenciamento de estado global, facilitando:

- Controle de temas e preferências do usuário
- Estado da interface (menus abertos, diálogos, etc)
- Sincronização entre componentes

### Design System Consistente

- **Tokens de Design**: Cores, tipografia, espaçamento padronizados
- **Componentes Base**: Botões, inputs, cards com variantes
- **Responsividade**: Layout adaptável para todos os tamanhos de tela
- **Acessibilidade**: Suporte a temas claro/escuro, alto contraste e redução de movimento

### Acessibilidade

- Suporte para navegação por teclado
- Atributos ARIA apropriados
- Temas de alto contraste
- Opções de tamanho de fonte e redução de movimento

## 📝 Funcionalidades Principais

- Autenticação e autorização baseadas em perfis
- Dashboard com métricas e visualizações
- Gerenciamento completo de funcionários (CRUD)
- Gerenciamento de departamentos
- Relatórios e visão de estatísticas
- Perfil de usuário personalizável
- Tema claro/escuro e preferências de acessibilidade

## 🔧 Estrutura do Projeto

```
src/
├── app/                 # Rotas da aplicação (App Router)
├── components/          # Componentes React
│   ├── layout/          # Componentes estruturais
│   ├── pages/           # Componentes específicos de página
│   ├── shared/          # Componentes compartilhados
│   │   ├── auth/        # Componentes de autenticação
│   │   ├── data-display/ # Componentes de exibição de dados
│   │   ├── dialogs/     # Modais e diálogos
│   │   ├── filters/     # Barras e opções de filtro
│   │   ├── forms/       # Componentes de formulário
│   │   ├── layout/      # Componentes de layout
│   │   ├── lists/       # Componentes de lista
│   │   ├── onboarding/  # Componentes de onboarding
│   │   ├── theme/       # Componentes de tema
│   │   └── utils/       # Utilitários compartilhados
│   └── ui/              # Componentes base do design system
├── hooks/               # Hooks personalizados
├── lib/                 # Bibliotecas e utilitários
├── providers/           # Provedores de contexto
├── redux/               # Configuração e slices Redux
│   ├── features/        # Features do Redux Toolkit
│   └── store/           # Configuração da store
├── services/            # Serviços de API e lógica de negócios
├── types/               # Definições de tipos TypeScript
└── test/                # Testes
```

## 🏃‍♂️ Como Executar

### Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/test-react-ab-inbev.git
   cd test-react-ab-inbev/front-next
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn
   ```

3. Execute o ambiente de desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse `http://localhost:3000` no seu navegador

### Credenciais de Teste

Use as seguintes credenciais para testar a aplicação:

- **Email**: admin@companymanager.com
- **Senha**: Admin@123

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📦 Build e Deploy

Para gerar uma versão de produção:

```bash
npm run build
npm start
```

## 🎨 Design e UX

O projeto implementa princípios modernos de UX/UI:

- **Microinterações**: Feedback visual para ações do usuário
- **Hierarquia Visual**: Organização clara de elementos e informações
- **Consistência**: Padrões consistentes em toda a interface
- **Acessibilidade**: Suporte para diversas necessidades
- **Responsividade**: Adaptação para diferentes dispositivos
- **Onboarding**: Orientação para novos usuários

## 🔍 Design Patterns Aplicados

O projeto implementa diversos design patterns para organização, reusabilidade e manutenção do código:

1. **Container/Presentational Pattern**
   - Separação clara entre lógica e apresentação
   - Componentes presentacionais reutilizáveis

2. **Provider Pattern**
   - Context API para compartilhamento de estado
   - Provedores para autenticação, tema e recursos

3. **Compound Components Pattern**
   - Componentes compostos para formulários, cards, etc.
   - API flexível com componentes que trabalham juntos

4. **Custom Hook Pattern**
   - Hooks para lógica reutilizável (auth, forms, queries)
   - Separação de preocupações

5. **Adapter Pattern**
   - Adaptação de dados da API para uso na UI
   - Camada de serviço que abstrai detalhes de implementação

6. **Redux Toolkit para Estado Global**
   - Slices para diferentes domínios (ui, theme, etc)
   - Estado persistente e facilmente testável

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🌟 Reconhecimentos

- Componentes base adaptados do shadcn/ui
- Ícones de Lucide React