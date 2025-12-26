import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import kafkaTestRoutes from './src/api/kafka-test.routes';
import UserGetClaimRoutes from './src/api/getUserClaims.routes';

import { startKafkaConsumer } from './src/kafka/consumer'; 

//Démarrage du consumer Kafka
async function bootstrap() {
  await startKafkaConsumer();
}
bootstrap();

//Client Clerk SDK
const { clerkClient } = require("@clerk/clerk-sdk-node");
dotenv.config();

//express app setup
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/kafka', kafkaTestRoutes);
app.use('/api/user', UserGetClaimRoutes);

app.post("/api/sso/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: "token required" });

    const payload = await clerkClient.verifyToken(token);
    const userId = payload.sub;

    const user = await clerkClient.users.getUser(userId);

    const primaryEmail =
      user.emailAddresses?.find((e: { id: any; }) => e.id === user.primaryEmailAddressId)?.emailAddress
      || user.emailAddresses?.[0]?.emailAddress
      || null;

    return res.json({ ok: true, userId, email: primaryEmail });
  } catch (e) {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
});



// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// Routes à ajouter plus tard
// app.use('/api/claims', claimsRoutes);
// app.use('/api/employees', employeesRoutes);
// app.use('/api/teams', teamsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;