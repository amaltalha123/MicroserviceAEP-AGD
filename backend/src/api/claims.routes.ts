import { Router } from "express";
import prisma from "../config/database";

type TeamMemberDTO = {
  id: string;
  name: string;
  email: string | null;
  isLeader: boolean | null;
};

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ ok: false, message: "id requis" });

    // 1) Claim
    const claim = await prisma.claims.findUnique({
      where: { id },
      select: {
        id: true,
        claim_number: true,
        internal_ticket_number: true,
        service_type: true,
        priority: true,
        status: true,
        title: true,
        description: true,
        location_address: true,
        location_lat: true,
        location_lng: true,
        user_name: true,
        user_email: true,
        user_phone: true,
        intervention_scheduled_date: true,
        created_at: true,
        team_assigned_at: true,
        resolution_description: true,
        resolution_submitted_at: true,
        resolved_at: true,
        // si tu l'as dans prisma :
        requires_supervisor_validation: true,
      },
    });

    if (!claim) return res.status(404).json({ ok: false, message: "Claim introuvable" });

    // 2) Team liée à la claim (si existe)
    const team = await prisma.intervention_teams.findFirst({
      where: { claim_id: id },
      select: {
        id: true,
        service_type: true,
        team_leader_id: true,
        team_supervisor_id: true,
      },
    });

    let leader = null;
    let supervisor = null;
    let members: TeamMemberDTO[] = [];

    if (team) {
      leader = await prisma.employees.findUnique({
        where: { id: team.team_leader_id },
        select: { id: true, full_name: true, email: true },
      });

      if (team.team_supervisor_id) {
        supervisor = await prisma.employees.findUnique({
          where: { id: team.team_supervisor_id },
          select: { id: true, full_name: true, email: true },
        });
      }

      const memberRows = await prisma.team_members.findMany({
        where: { team_id: team.id },
        select: { employee_id: true, is_leader: true },
      });

      const empIds = memberRows.map((m) => m.employee_id);
      const emps = empIds.length
        ? await prisma.employees.findMany({
            where: { id: { in: empIds } },
            select: { id: true, full_name: true, email: true },
          })
        : [];

      members = memberRows.map((m) => {
        const emp = emps.find((e) => e.id === m.employee_id);
        return {
          id: m.employee_id,
          name: emp?.full_name || "Inconnu",
          email: emp?.email || null,
          isLeader: m.is_leader,
        };
      });
    }

    // 3) Timeline (si table claim_actions)
    const timeline = await prisma.claim_actions.findMany({
  where: { claim_id: id },
  orderBy: { created_at: "asc" },
  select: {
    id: true,
    action_type: true,
    action_description: true,
    created_at: true,
    previous_status: true,
    new_status: true,
  },
});


    return res.json({
      ok: true,
      claim,
      team: team
        ? {
            id: team.id,
            leader,
            supervisor,
            members,
          }
        : null,
      timeline,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || "Erreur serveur" });
  }
});

export default router;
