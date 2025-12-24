import { kafkaProducer } from '../config/kafka';
import { randomUUID } from 'crypto';

export interface StatusUpdatePayload {
  claimId: string;
  claimNumber: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  serviceReference: string | null;
  assignedTo?: {
    operatorId: string;
    operatorName: string;
  };
  resolution?: {
    summary: string;
    actionsTaken: string[];
    closingMessage: string;
  };
}

export async function sendStatusUpdate(payload: StatusUpdatePayload): Promise<void> {
  try {
    await kafkaProducer.connect();

    const message = {
      messageId: randomUUID(),
      messageType: 'STATUS_UPDATE',
      timestamp: new Date().toISOString(),
      version: '1.0',
      claimId: payload.claimId,
      claimNumber: payload.claimNumber,
      correlationId: randomUUID(),
      status: {
        previous: payload.previousStatus,
        new: payload.newStatus,
        reason: payload.reason,
        ...(payload.assignedTo && { assignedTo: payload.assignedTo }),
      },
      ...(payload.resolution && { resolution: payload.resolution }),
      serviceReference: payload.serviceReference,
    };

    await kafkaProducer.send({
      topic: 'claims.AEP',
      messages: [
        {
          key: payload.claimId,
          value: JSON.stringify(message),
          headers: {
            messageType: 'STATUS_UPDATE',
            version: '1.0',
          },
        },
      ],
    });

    console.log('📤 Status update envoyé à Kafka:', {
      claimNumber: payload.claimNumber,
      status: `${payload.previousStatus} -> ${payload.newStatus}`,
      messageId: message.messageId,
    });

    await kafkaProducer.disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du status update:', error);
    throw error;
  }
}