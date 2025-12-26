import prisma from '../../config/database';
import { ClaimPayload } from '../../types/kafka.types';

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
export class ClientClaimsService {

     async getConnectedUserClaims(userId: string) {
            try {
        const claims = await prisma.claims.findMany({
            where: { user_id: userId },
            include: {
            intervention_teams: true, // si nécessaire
            },
        });

        const formattedClaims = claims.map(mapClaimToResponse);

        return formattedClaims;
        } catch (error) {
        console.error(
            "Erreur lors de la récupération des réclamations de l'utilisateur:",
            error
        );

        return [];
        }
      }
    
}

    function mapClaimToResponse(claim: any): ClaimResponse {
        return {
            id: claim.id,
            claimNumber: claim.claim_number,
            internalTicket: claim.internal_ticket_number,
            title: claim.title,
            priority: claim.priority,
            service: claim.service_type,
            status: claim.status,
            location: claim.location_address,
            createdAt: claim.created_at,
            scheduledDate: claim.intervention_scheduled_date,
            teamLeader: claim.intervention_teams?.team_leader_name ?? null,
        };
    }

    
