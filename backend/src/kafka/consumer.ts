import { kafkaConsumer } from '../config/kafka';
import { ClaimsService } from '../modules/claims/claims.service';

const claimsService = new ClaimsService();

export async function startKafkaConsumer() {
  await kafkaConsumer.connect();

  await kafkaConsumer.subscribe({
    topics: ['claims.AEP'],
    fromBeginning: false,
  });

  console.log('🟢 Kafka Consumer connecté');

  await kafkaConsumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value!.toString());

        console.log(`📥 Message reçu (${topic})`, payload.claimNumber);

        await claimsService.createClaimFromKafka(payload);

        console.log('✅ Réclamation enregistrée en DB');
      } catch (error) {
        console.error('❌ Erreur consumer Kafka:', error);
      }
    },
  });
}
