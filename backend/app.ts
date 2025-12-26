import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import kafkaTestRoutes from './src/api/kafka-test.routes';
import testRoutes from './src/api/test.routes';
import { startKafkaConsumer } from './src/kafka/consumer'; 
import teamRoutes from "./src/api/team.routes";
import supervisorRoutes from "./src/api/supervisor.routes";
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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/kafka', kafkaTestRoutes);
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

// ← AJOUTEZ CETTE LIGNE
app.use('/api/test', testRoutes);

// Routes à ajouter plus tard
// app.use('/api/claims', claimsRoutes);
// app.use('/api/employees', employeesRoutes);
// app.use('/api/teams', teamsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/supervisor", supervisorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;