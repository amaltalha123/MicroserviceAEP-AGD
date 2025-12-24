import prisma from '../../config/database';
import { ClaimPayload } from '../../types/kafka.types';
import { sendStatusUpdate } from '../../kafka/statusUpdateProducer';

export class ClaimsService {
  async createClaimFromKafka(payload: ClaimPayload) {
    // 1. Vérifier si une équipe peut être créée
    const canCreateTeam = await this.checkTeamAvailability(payload.claim.serviceType);
    
    if (!canCreateTeam) {
      // Envoyer un message Kafka indiquant que la réclamation ne peut pas être traitée
      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'submitted',
        newStatus: 'rejected',
        reason: 'Aucune équipe disponible pour le moment.',
        serviceReference: null,
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
    const claim = await prisma.claims.create({
      data: {
        portal_claim_id: payload.claimId,
        claim_number: payload.claimNumber,
        service_type: payload.claim.serviceType,
        user_id: payload.user.id,
        user_email: payload.user.email,
        user_name: payload.user.name,
        user_phone: payload.user.phone,
        title: payload.claim.title,
        description: payload.claim.description,
        priority: payload.claim.priority,
        location_address: payload.claim.location.address,
        location_lat: payload.claim.location.latitude,
        location_lng: payload.claim.location.longitude,
        service_specific_data: payload.claim.extraData,
        status: 'received',
      },
    });

    // 3. Calculer la date d'intervention
    const interventionDate = this.calculateInterventionDate(payload.claim.priority);

    await prisma.claims.update({
      where: { id: claim.id },
      data: { intervention_scheduled_date: interventionDate },
    });

    // 4. Créer l'équipe automatiquement
    try {
      const teamId = await this.createInterventionTeam(claim.id, payload.claim.serviceType);

      await prisma.claims.update({
        where: { id: claim.id },
        data: {
          status: 'assigned',
          team_assigned_at: new Date(),
        },
      });

      // Envoyer notification de succès
      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'received',
        newStatus: 'assigned',
        reason: 'Équipe assignée avec succès',
        serviceReference: claim.internal_ticket_number,
      });

      return { claim, teamId, success: true };
    } catch (error) {
      console.error('Erreur création équipe:', error);

      // Envoyer notification d'erreur
      await sendStatusUpdate({
        claimId: payload.claimId,
        claimNumber: payload.claimNumber,
        previousStatus: 'received',
        newStatus: 'pending_info',
        reason: 'Erreur lors de l\'assignation de l\'équipe',
        serviceReference: claim.internal_ticket_number,
      });

      return { claim, teamId: null, success: false, error };
    }
  }

  /**
   * Vérifie si une équipe peut être créée pour un type de service
   */
  private async checkTeamAvailability(serviceType: 'lighting' | 'waste'): Promise<boolean> {
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

  private async createInterventionTeam(claimId: string, serviceType: 'lighting' | 'waste') {
    // Appeler la fonction SQL auto_create_intervention_team
    const result = await prisma.$queryRaw<{ auto_create_intervention_team: string }[]>`
      SELECT auto_create_intervention_team(${claimId}::uuid, ${serviceType}::service_type)
    `;
    return result[0].auto_create_intervention_team;
  }
}