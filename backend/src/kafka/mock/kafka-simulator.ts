import { 
  ClaimPayload, 
  MessageType,    // ← Ajouté
  ServiceType,    // ← Ajouté
  PriorityLevel
} from '../../types/kafka.types';

type QualificationType = 
  | 'bac_plein'
  | 'debordement_sanitaire'
  | 'depot_sauvage'
  | 'lampadaire_eteint'
  | 'situation_dangereuse'
  | 'eclairage_faible';

export class KafkaSimulator {
    
  /**
   * Simule la réception d'un message CLAIM_CREATED
   */
  static generateMockClaimMessage(): ClaimPayload {
    const isLighting = Math.random() > 0.5;
    
    // Qualifications pour l'éclairage
    const lightingQualifications: QualificationType[] = [
      'lampadaire_eteint',
      'situation_dangereuse',
      'eclairage_faible',
    ];
    
    // Qualifications pour les déchets
    const wasteQualifications: QualificationType[] = [
      'bac_plein',
      'debordement_sanitaire',
      'depot_sauvage',
    ];
    
    const qualifications = isLighting ? lightingQualifications : wasteQualifications;
    const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
    return {
      messageId: crypto.randomUUID(),
      messageType: MessageType.CLAIM_CREATED,
      timestamp: new Date().toISOString(),
      version: '1.0',
      claimId: crypto.randomUUID(),
      claimNumber: `CLM-2024-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      user: {
        id: 'user_mock_123',
        email: 'citoyen.test@example.com',
        name: 'Mohammed Test',
        phone: '+212600123456',
      },
      claim: {
        serviceType: ServiceType.LIGHTING,
        title: 'Test de réclamation',
        description: 'Ceci est une réclamation de test',
        priority: PriorityLevel.HIGH,
        location: {
          address: 'Rue Mohammed V, Marrakech',
          latitude: 31.6295,
          longitude: -7.9811,
        },
        attachments: [],
       extraData: {
          qualification, // ← Chaîne de caractères simple
        },
      },
      correlationId: crypto.randomUUID(),
    };
  }
}