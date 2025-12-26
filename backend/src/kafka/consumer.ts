import { kafkaConsumer } from '../config/kafka';
import { ClaimsService } from '../modules/claims/claimsConsumerProducer.service';

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

        // ✅ FILTRE : Ne traiter QUE les messages CLAIM_CREATED
        if (payload.messageType !== 'CLAIM_CREATED') {
          console.log(`⏭️ Message ignoré (type: ${payload.messageType})`);
          return;
        }

        await claimsService.createClaimFromKafka(payload);

        console.log('✅ Réclamation enregistrée en DB');
      } catch (error) {
        console.error('❌ Erreur consumer Kafka:', error);
      }
    },
  });
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du consumer Kafka...');
  await kafkaConsumer.disconnect();
  process.exit(0);
});