import prisma from '../../config/database';
import { ClaimPayload } from '../../types/kafka.types';
import { sendStatusUpdate } from '../../kafka/statusUpdateProducer';
import { TeamEmailDispatcher } from "../../services/email/teamEmailDispatcher.service"; 


export class ClaimsService {
  async createClaimFromKafka(payload: ClaimPayload) {
    // ✅ VALIDATION DU PAYLOAD
    if (!payload || typeof payload !== 'object') {
      console.error(' Payload invalide: pas un objet', payload);
      throw new Error('Payload invalide: format incorrect');
    }

    // Vérifier le type de message
    if (payload.messageType !== 'CLAIM_CREATED') {
      console.warn(' Type de message non supporté:', payload.messageType);
      throw new Error(`Type de message non supporté: ${payload.messageType}`);
    }

    if (!payload.claim) {
      console.error(' Payload invalide - structure claim manquante:', {
        messageType: payload.messageType,
        hasClaimId: !!payload.claimId,
        keys: Object.keys(payload)
      });
      throw new Error('Payload invalide: structure claim manquante');
    }

    const { claim } = payload;

    // Vérifier que serviceType existe
    if (!claim.serviceType) {
      console.error(' serviceType manquant dans le payload:', payload);
      throw new Error('serviceType manquant dans claim');
    }

    console.log(' Service Type détecté:', claim.serviceType);

    // 1. Vérifier si une équipe peut être créée
    const canCreateTeam = await this.checkTeamAvailability(claim.serviceType);
    
    if (!canCreateTeam) {
      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'submitted',
        newStatus: 'rejected',
        reason: 'Aucune équipe disponible pour le moment.',
        serviceReference: null,
      });

      const createdClaim = await prisma.claims.create({
        data: {
          portal_claim_id: payload.claimId,
          claim_number: payload.claimNumber,
          service_type: claim.serviceType,
          user_id: payload.user.id,
          user_email: payload.user.email,
          user_name: payload.user.name,
          user_phone: payload.user.phone,
          title: claim.title,
          description: claim.description,
          priority: claim.priority,
          location_address: claim.location.address,
          location_lat: claim.location.latitude,
          location_lng: claim.location.longitude,
          service_specific_data: claim.extraData,
          status: 'rejected',
        },
      });

      const action=await prisma.claim_actions.create({
        data: {
          claim_id: createdClaim.id,
          action_type: 'REJECTION_NO_TEAM',
          action_description: 'REJECTION_NO_TEAM',
          previous_status: 'submitted',
          new_status: 'rejected'
        },
      });

      
      return {
        success: false,
        error: 'NO_TEAM_AVAILABLE',
        message: 'Aucune équipe disponible pour traiter cette réclamation',
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
      };
    }

    // 2. Créer la réclamation
    const createdClaim = await prisma.claims.create({
      data: {
        portal_claim_id: payload.claimId,
        claim_number: payload.claimNumber,
        service_type: claim.serviceType,
        user_id: payload.user.id,
        user_email: payload.user.email,
        user_name: payload.user.name,
        user_phone: payload.user.phone,
        title: claim.title,
        description: claim.description,
        priority: claim.priority,
        location_address: claim.location.address,
        location_lat: claim.location.latitude,
        location_lng: claim.location.longitude,
        service_specific_data: claim.extraData,
        status: 'received',
      },
    });
      
    
    // 3. Calculer la date d'intervention
    const interventionDate = this.calculateInterventionDate(claim.priority);

    await prisma.claims.update({
      where: { id: createdClaim.id },
      data: { intervention_scheduled_date: interventionDate },
    });

    // 4. Créer l'équipe automatiquement
    try {
      const teamId = await this.createInterventionTeam(
        createdClaim.id, 
        claim.serviceType
      );

      await prisma.claims.update({
        where: { id: createdClaim.id },
        data: {
          status: 'assigned',
          team_assigned_at: new Date(),
        },
      });
      await prisma.claim_actions.create({
        data: {
          claim_id: createdClaim.id,
          action_type: 'REJECTION_NO_TEAM',
          action_description: 'REJECTION_NO_TEAM',
          previous_status: 'submitted',
          new_status: 'assigned'
        },
      });
      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'received',
        newStatus: 'assigned',
        reason: 'Équipe assignée avec succès',
        serviceReference: createdClaim.internal_ticket_number,
      });
      console.log('Équipe créée avec succès, ID:', teamId);

const dispatcher = new TeamEmailDispatcher();
await dispatcher.sendAfterTeamAssignment(createdClaim.id, teamId);
console.log("Emails envoyés aux membres de l'équipe ");
      //Après qu'on envoi les emails on change le status en in_progress
      
       await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'assigned',
        newStatus: 'in_progress',
        reason: 'Réclamation en cours de traitement',
        serviceReference: createdClaim.internal_ticket_number,
      });

      await prisma.claim_actions.create({
        data: {
          claim_id: createdClaim.id,
          action_type: 'REJECTION_NO_TEAM',
          action_description: 'REJECTION_NO_TEAM',
          previous_status: 'assigned',
          new_status: 'in_progress'
        },
      });
      return { claim: createdClaim, teamId, success: true };
    } catch (error) {
      console.error('Erreur création équipe:', error);

      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'received',
        newStatus: 'pending_info',
        reason: 'Erreur lors de l\'assignation de l\'équipe',
        serviceReference: createdClaim.internal_ticket_number,
      });

      return { claim: createdClaim, teamId: null, success: false, error };
    }
  }

  private async checkTeamAvailability(
    serviceType: 'lighting' | 'waste'
  ): Promise<boolean> {
    const result = await prisma.$queryRaw<{ can_create_new_team: boolean }[]>`
      SELECT can_create_new_team(${serviceType}::service_type)
    `;
    
    return result[0]?.can_create_new_team ?? false;
  }

  private calculateInterventionDate(priority: string): Date {
    const now = new Date();
    switch (priority) {
      case 'urgent':
        return now;
      case 'high':
        return new Date(now.setDate(now.getDate() + 1));
      case 'medium':
        return new Date(now.setDate(now.getDate() + 3));
      case 'low':
        return new Date(now.setDate(now.getDate() + 7));
      default:
        return new Date(now.setDate(now.getDate() + 3));
    }
  }

  private async createInterventionTeam(
    claimId: string, 
    serviceType: 'lighting' | 'waste'
  ) {
    const result = await prisma.$queryRaw<{ auto_create_intervention_team: string }[]>`
      SELECT auto_create_intervention_team(${claimId}::uuid, ${serviceType}::service_type)
    `;
    return result[0].auto_create_intervention_team;
  }
}