import { kafkaProducer } from '../config/kafka';
import { ClaimPayload } from '../types/kafka.types';

export async function sendClaimCreated(payload: ClaimPayload) {
  let connected = false;
  
  try {
    // Validation du payload avant l'envoi
    if (!payload.claim || !payload.claim.serviceType) {
      throw new Error('Payload invalide: claim.serviceType manquant');
    }

    // Toujours se connecter (KafkaJS gère la réutilisation de connexion)
    console.log('🔧 Connexion au producer Kafka...');
    await kafkaProducer.connect();
    connected = true;
    console.log('✅ Producer connecté');

    console.log('📤 Envoi du claim à Kafka:', {
      claimNumber: payload.claimNumber,
      serviceType: payload.claim.serviceType,
      hasLocation: !!payload.claim.location
    });

    await kafkaProducer.send({
      topic: 'claims.AEP',
      messages: [
        {
          key: payload.claimId,
          value: JSON.stringify(payload),
        },
      ],
    });

    console.log('✅ Claim envoyé à Kafka:', payload.claimNumber);
  } catch (error) {
    console.error('❌ Erreur envoi Kafka:', error);
    throw error;
  }
  // Ne pas déconnecter ici - laisser la connexion active pour les prochains envois
}

// Déconnecter uniquement lors de l'arrêt de l'application
const cleanup = async () => {
  try {
    console.log('🛑 Déconnexion du producer Kafka...');
    await kafkaProducer.disconnect();
    console.log('✅ Producer déconnecté');
  } catch (error) {
    console.error('❌ Erreur déconnexion producer:', error);
  }
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('beforeExit', cleanup);