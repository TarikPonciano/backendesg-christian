# Etapa 1: Usar a imagem oficial do Node.js como base
FROM node:16-alpine

# Etapa 2: Criar o diretório de trabalho dentro do container
WORKDIR /app

# Etapa 3: Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Etapa 4: Instalar as dependências do projeto
RUN npm install --production

# Etapa 5: Copiar todo o código-fonte para dentro do container
COPY . .

# Etapa 6: Expor a porta que a aplicação vai usar
EXPOSE 4000

# Etapa 7: Definir o comando padrão para rodar o servidor
CMD ["npm", "start"]
