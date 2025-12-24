import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'lighting-waste-service',
  brokers: (process.env.KAFKA_BROKERS || '54.226.8.25:9092').split(','),
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({
  groupId: 'lighting-waste-consumer-group',
});

