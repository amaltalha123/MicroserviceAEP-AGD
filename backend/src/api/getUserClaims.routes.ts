import { Router } from 'express';
import { ClientClaimsService} from '../modules/claims/ClientClaims.service';

const router = Router();

router.post('/get-user-claims', async (req, res) => {
  try {
    const cl = new ClientClaimsService();
    const userId = req.body.userId; // Récupérer l'ID utilisateur depuis le corps de la requête

    const payloads = await cl.getConnectedUserClaims(userId);

    res.json({
      success: true,
      message: 'Message Kafka produit avec succès',
      data: payloads,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
