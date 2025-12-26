import { Router } from 'express';
import { KafkaSimulator } from '../kafka/mock/kafka-simulator';
import { sendClaimCreated } from '../kafka/producerAEP';

const router = Router();

router.post('/produce-claim', async (req, res) => {
  try {
    const payload = KafkaSimulator.generateMockClaimMessage();

    await sendClaimCreated(payload);

    res.json({
      success: true,
      message: 'Message Kafka produit avec succès',
      data: payload,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
