FROM node:18-alpine AS base

# Instalar dependências necessárias para o Prisma
RUN apk add --no-cache libc6-compat openssl

# Diretório de trabalho
WORKDIR /app

# Instalação de dependências
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Construção da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construção da aplicação Next.js
RUN npm run build

# Imagem de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar o código compilado
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Configurar usuário não-root
USER nextjs

# Expor a porta
EXPOSE 3000

# Definir host para aceitar conexões externas
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]