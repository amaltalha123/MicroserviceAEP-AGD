import { 
  ClaimPayload, 
  MessageType,    // ← Ajouté
  ServiceType,    // ← Ajouté
  PriorityLevel
} from '../../types/kafka.types';


export class KafkaSimulator {
    
  /**
   * Simule la réception d'un message CLAIM_CREATED
   */
  static generateMockClaimMessage(): ClaimPayload {
    const isLighting = Math.random() > 0.5;
    
    return {
      messageId: crypto.randomUUID(),
      messageType: MessageType.CLAIM_CREATED,
      timestamp: new Date().toISOString(),
      version: '1.0',
      claimId: crypto.randomUUID(),
      claimNumber: `CLM-2024-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      user: {
        id: 'user_37Of0nMciSabwYYosYsyJ83VWjH',
        email: 'tlhamal84@gmail.com',
        name: 'amal',
        phone: '0612345678',
      },
      claim: {
        serviceType: ServiceType.LIGHTING,
        title: 'Test de réclamation waste',
        description: 'Ceci est une réclamation de test de waste',
        priority: PriorityLevel.MEDIUM,
        location: {
          address: 'Rue Mohammed V, Marrakech',
          latitude: 31.6295,
          longitude: -7.9811,
        },
        attachments: [],
       extraData: {
          
        },
      },
      correlationId: crypto.randomUUID(),
    };
  }
}