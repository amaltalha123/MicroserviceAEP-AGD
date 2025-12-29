# Utilisez Node.js 20
FROM node:20-alpine

# Installer OpenSSL pour Prisma
RUN apk add --no-cache openssl openssl-dev

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le schema Prisma
COPY prisma ./prisma/

# Générer Prisma Client avec les bons binaires pour Alpine
RUN npx prisma generate

# Copier tout le code source (y compris src/)
COPY . .

# Exposer le port 3001
EXPOSE 3001

# Démarrer l'application (npm start utilise "ts-node src/app.ts")
CMD ["npm", "start"]