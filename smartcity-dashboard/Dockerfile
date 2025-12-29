# UTILISEZ NODE.JS 20 (pas 18 !)
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port Vite
EXPOSE 5173

# Démarrer Vite avec --host pour accès externe
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]