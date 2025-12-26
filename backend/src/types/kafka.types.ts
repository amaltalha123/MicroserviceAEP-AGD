// src/types/kafka.types.ts

/**
 * Types pour les messages Kafka
 * Communication entre le Portail Citoyen et le Microservice
 */

// ============================================
// ENUMS
// ============================================


export enum MessageType {
  CLAIM_CREATED = 'CLAIM_CREATED',
  CLAIM_UPDATED = 'CLAIM_UPDATED',
  CLAIM_STATUS_CHANGED = 'CLAIM_STATUS_CHANGED',
  TEAM_ASSIGNED = 'TEAM_ASSIGNED',
  CLAIM_RESOLVED = 'CLAIM_RESOLVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
}

export enum ServiceType {
  LIGHTING = 'lighting',
  WASTE = 'waste',
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ClaimStatus {
  RECEIVED = 'received',
  TEAM_ASSIGNED = 'team_assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}



// ============================================
// INTERFACES - MESSAGES ENTRANTS (FROM PORTAL)
// ============================================

/**
 * Message principal reçu du portail citoyen
 * Topic: claims.lighting ou claims.waste
 */
export interface ClaimPayload {
  // Metadata du message
  messageId: string;
  messageType: MessageType;
  timestamp: string; // ISO 8601
  version: string; // ex: "1.0"

  // Identifiants
  claimId: string; // UUID du portail
  claimNumber: string; // Ex: CLM-2024-00123

  // Informations utilisateur
  user: UserInfo;

  // Détails de la réclamation
  claim: ClaimDetails;

  // Pour le traçage
  correlationId: string;
}

/**
 * Informations sur l'utilisateur qui a créé la réclamation
 */
export interface UserInfo {
  id: string; // Clerk User ID
  email: string;
  name?: string;
  phone?: string;
}

/**
 * Détails de la réclamation
 */
export interface ClaimDetails {
  serviceType: ServiceType;
  title: string;
  description: string;
  priority: PriorityLevel;
  
  location: LocationInfo;
  
  // Photos uploadées par le citoyen
  attachments: Attachment[];
  
  // Données spécifiques au service (qualification, etc.)
  extraData: Record<string, any>;
}

/**
 * Localisation de la réclamation
 */
export interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
  district?: string; // Quartier
  city?: string;
}

/**
 * Pièce jointe (photo)
 */
export interface Attachment {
  id: string;
  url: string; // URL de stockage (Cloudinary, S3, etc.)
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}
export interface ClaimResponse {
  id: string;
  claimNumber: string;
  internalTicket: string | null;
  title: string;
  priority: string;
  service: string;
  status: string | null;
  location: string;
  createdAt: Date | null;
  scheduledDate: Date | null;
  teamLeader: string | null;
}
// ============================================
// INTERFACES - MESSAGES SORTANTS (TO PORTAL)
// ============================================

/**
 * Message de mise à jour de statut envoyé au portail
 * Topic: claims.status-updates
 */
export interface StatusUpdatePayload {
  messageId: string;
  messageType: MessageType;
  timestamp: string;
  version: string;

  // Référence à la réclamation du portail
  portalClaimId: string;
  claimNumber: string;

  // Nouveau statut
  status: ClaimStatus;
  previousStatus?: ClaimStatus;

  // Détails de la mise à jour
  update: StatusUpdateDetails;

  // Traçage
  correlationId: string;
}

/**
 * Détails d'une mise à jour de statut
 */
export interface StatusUpdateDetails {
  // Qui a fait l'action
  performedBy: {
    id: string;
    name: string;
    type: 'system' | 'employee' | 'supervisor';
  };

  // Raison du changement
  reason?: string;
  comment?: string;

  // Si équipe assignée
  team?: TeamInfo;

  // Si résolu
  resolution?: ResolutionInfo;

  // Metadata additionnelle
  metadata?: Record<string, any>;
}

/**
 * Informations sur l'équipe assignée
 */
export interface TeamInfo {
  teamId: string;
  teamLeaderId: string;
  teamLeaderName: string;
  teamLeaderEmail: string;
  members: TeamMember[];
  assignedAt: string;
}

/**
 * Membre d'équipe
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
}

/**
 * Informations de résolution
 */
export interface ResolutionInfo {
  description: string;
  resolvedAt: string;
  resolvedBy: {
    id: string;
    name: string;
  };
  photos?: Attachment[];
  duration?: number; // Durée en heures
}

// ============================================
// INTERFACES - LOGS ET TRACKING
// ============================================

/**
 * Log d'un message Kafka pour la base de données
 */
export interface KafkaMessageLog {
  id?: string;
  claimId?: string;
  kafkaMessageId: string;
  kafkaTopic: string;
  messageType: string;
  payload: any;
  direction: 'inbound' | 'outbound';
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  createdAt?: Date;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Vérifie si un payload est un ClaimPayload valide
 */
export function isClaimPayload(payload: any): payload is ClaimPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    'messageId' in payload &&
    'claimId' in payload &&
    'user' in payload &&
    'claim' in payload
  );
}

/**
 * Vérifie si un payload est un StatusUpdatePayload valide
 */
export function isStatusUpdatePayload(
  payload: any
): payload is StatusUpdatePayload {
  return (
    payload &&
    typeof payload === 'object' &&
    'messageId' in payload &&
    'portalClaimId' in payload &&
    'status' in payload
  );
}

// ============================================
// HELPERS
// ============================================

/**
 * Génère un ID de corrélation unique
 */
export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Génère un ID de message unique
 */
export function generateMessageId(prefix: string = 'msg'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Valide le format d'un UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================
// CONSTANTES
// ============================================

export const KAFKA_TOPICS = {
  CLAIMS_LIGHTING: 'claims.lighting',
  CLAIMS_WASTE: 'claims.waste',
  STATUS_UPDATES: 'claims.status-updates',
  NOTIFICATIONS: 'claims.notifications',
} as const;

export const MESSAGE_VERSION = '1.0';

export const KAFKA_CONSUMER_GROUP = 'lighting-waste-consumer-group';