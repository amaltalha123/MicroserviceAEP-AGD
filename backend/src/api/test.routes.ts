import { Router } from 'express';
import { KafkaSimulator } from '../kafka/mock/kafka-simulator';
import { ClaimsService } from '../modules/claims/claims.service';
const router = Router();
const claimsService = new ClaimsService();
// Endpoint pour simuler la réception d'un message Kafka
router.post('/simulate-claim', async (req, res) => {
  try {
    const mockMessage = KafkaSimulator.generateMockClaimMessage();
    const result = await claimsService.createClaimFromKafka(mockMessage);

    res.json({
      message: 'Réclamation créée avec succès',
      data: result,
    });
  } catch (error) {
    console.error('❌ Erreur simulate-claim:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

export default router;
