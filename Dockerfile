# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências e Vite globalmente
RUN npm install && \
    npm install -g vite

# Copiar o resto dos arquivos
COPY . .

# Criar diretório .cache e ajustar permissões
RUN mkdir -p /app/node_modules/.cache && \
    chown -R node:node /app && \
    chmod -R 755 /app

# Mudar para o usuário node
USER node

# Definir variável de ambiente para o cache do Vite
ENV VITE_CACHE_DIR=/app/node_modules/.cache

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar os arquivos de build para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 