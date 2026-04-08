# Plateforme de Gestion des Réclamations Citoyennes

> Système de gestion des réclamations municipales basé sur une architecture microservices event-driven avec Kafka

## Aperçu

Plateforme permettant aux citoyens de signaler des problèmes (éclairage public, déchets) et aux équipes municipales de les gérer efficacement.

**Fonctionnalités clés:**
- Soumission et suivi de réclamations
- Géolocalisation des incidents
- Assignation d'équipes terrain
- TSuivie de status des réclamations
- Notifications automatiques

---

**Stack:**
- **Frontend:** React + TypeScript + Tailwind
- **Backend:** Node.js + Express + TypeScript
- **Message Broker:** Apache Kafka
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Clerk

---

## Installation rapide

### Prérequis
- Node.js >= 18
- Docker Desktop
- Compte Clerk

### 1. Installation

```bash
# Cloner le projet
git clone https://github.com/amaltalha123/MicroserviceAEP-AGD.git
cd smartcity-claims

# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ../frontend
npm install
```

### 2. Configuration

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartcity_claims"
CLERK_SECRET_KEY="sk_test_..."
KAFKA_BROKERS=54.226.8.25
PORT=3001
```

**Frontend `.env`:**
```env
VITE_API_URL="http://localhost:3001"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Lancement

```bash
# Infrastructure (Kafka + PostgreSQL)
docker-compose up -d

# Database
cd backend
npx prisma db pull
npx prisma generate

# Backend API
npm run dev

# Frontend (nouveau terminal)
cd smartcity-dashboard
npm run dev

```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: `npx prisma studio`

---

## 📁 Structure

```
smartcity-claims/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Logique des routes
│   │   ├── kafka/          # Producer & Consumers
│   │   ├── services/       # Logique métier
│   │   └── prisma/         # Schéma DB
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages principales
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml
```

---

## API Endpoints

### Authentification
```http
POST /api/sso/verify
Body: { "token": "clerk_token" }
```

### Réclamations
```http
# Liste des réclamations
POST /api/user/get-user-claims
Body: { "userId": "user_xxx" }

# Créer une réclamation
POST /api/kafka/produce
Body: { messageType: "CLAIM_CREATED", claim: {...} }

# Simuler une réclamation (dev)
POST /api/kafka/simulate
```

---

## 📨 Messages Kafka

**Topic:** `claims.created`

**Format:**
```json
{
        "messageId": "e98344d3-aac0-4471-94bd-f12bfe3a8b56",
        "messageType": "CLAIM_CREATED",
        "timestamp": "2025-12-26T21:07:35.395Z",
        "version": "1.0",
        "claimId": "7091157b-2487-4b1f-bf1e-03320ffecdcd",
        "claimNumber": "CLM-2024-08293",
        "user": {
            "id": "user_Id_Clerk",
            "email": "name@gmail.com",
            "name": "name",
            "phone": "0612345678"
        },
        "claim": {
            "serviceType": "lighting",
            "title": "Test de réclamation éclairage",
            "description": "Ceci est une réclamation de test d éclairage",
            "priority": "high",
            "location": {
                "address": "Rue Mohammed V, Marrakech",
                "latitude": 31.6295,
                "longitude": -7.9811
            },
            "attachments": [],
            "extraData": {}
        },
        "correlationId": "24ecc632-fe1a-4842-bf83-ef69f09ca47e"
    }
```

---

## Base de données

**Modèle principal (Prisma):**
```prisma
model Claim {
  id              String    @id @default(uuid())
  claimNumber     String    @unique
  userId          String
  service         String    // "lighting" | "waste"
  title           String
  description     String
  priority        String
  status          String    @default("received")
  location        String
  latitude        Float?
  longitude       Float?
  createdAt       DateTime  @default(now())
  scheduledDate   DateTime?
  teamLeader      String?
}
```



---

## Tests

```bash
# executer l'api de simulation du producer
POST http://localhost:3001/api/kafka/produce-claim

---

## 🚢 Déploiement

### Build production

```bash
# Backend
cd backend
npm run build
npm run start

# Frontend
cd frontend
npm run build
# Fichiers dans dist/
```

### Docker


---

## 🛠️ Scripts utiles

**Backend:**
```bash
npm install
npm run dev              # Mode développement
npm run build            # Build TypeScript
npm run start            # Production
```

**Frontend:**
```bash
npm install
npm run dev              # Mode développement
npm run build            # Build production
npm run preview          # Prévisualiser build
```

---


## Documentation

- [Prisma](https://www.prisma.io/docs)
- [KafkaJS](https://kafka.js.org/)
- [Clerk Auth](https://clerk.com/docs)
- [React Router](https://reactrouter.com/)

---



## Auteur

**Nom** - [@amaltalha](https://github.com/amaltalha123)
