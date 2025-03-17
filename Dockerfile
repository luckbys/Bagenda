# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Garantir permissões corretas
RUN chown -R node:node /app

# Mudar para o usuário node
USER node

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