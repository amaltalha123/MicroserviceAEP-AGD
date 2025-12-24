import { kafkaProducer } from '../config/kafka';
import { ClaimPayload } from '../types/kafka.types';

export async function sendClaimCreated(payload: ClaimPayload) {
  await kafkaProducer.connect();

  await kafkaProducer.send({
    topic: 'claims.AEP',
    messages: [
      {
        key: payload.claimId,
        value: JSON.stringify(payload),
      },
    ],
  });

  console.log('📤 Claim envoyé à Kafka:', payload.claimNumber);

  await kafkaProducer.disconnect();
}

