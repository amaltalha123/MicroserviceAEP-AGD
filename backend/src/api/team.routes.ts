import { Router } from "express";
import prisma from "../config/database";

const router = Router();

/**
 * GET /api/team/resolve-info?token=...
 * Retourne les infos de la claim associée au token
 */
router.get("/resolve-info", async (req, res) => {
  try {
    const token = String(req.query.token || "");
    if (!token) return res.status(400).json({ ok: false, message: "token requis" });

    const team = await prisma.intervention_teams.findUnique({
      where: { resolution_token: token },
      select: {
        id: true,
        claim_id: true,
        team_leader_id: true,
        resolution_token_expires_at: true,
        is_active: true,
      },
    });

    if (!team) return res.status(404).json({ ok: false, message: "Token invalide" });

    if (team.resolution_token_expires_at && team.resolution_token_expires_at < new Date()) {
      return res.status(410).json({ ok: false, message: "Token expiré" });
    }

    const claim = await prisma.claims.findUnique({
      where: { id: team.claim_id },
      select: {
        id: true,
        claim_number: true,
        service_type: true,
        priority: true,
        title: true,
        description: true,
        location_address: true,
        status: true,
        resolution_description: true,
        resolution_submitted_at: true,
        resolved_at: true,
      },
    });

    if (!claim) return res.status(404).json({ ok: false, message: "Claim introuvable" });

    return res.json({ ok: true, claim });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || "Erreur serveur" });
  }
});

/**
 * POST /api/team/resolve
 * Body: { token, resolution_description }
 * Le leader soumet la résolution -> claim passe à "resolved"
 */
router.post("/resolve", async (req, res) => {
  try {
    const { token, resolution_description } = req.body || {};
    if (!token) return res.status(400).json({ ok: false, message: "token requis" });
    if (!resolution_description || String(resolution_description).trim().length < 5) {
      return res.status(400).json({ ok: false, message: "resolution_description trop courte" });
    }

    const team = await prisma.intervention_teams.findUnique({
      where: { resolution_token: String(token) },
      select: {
        id: true,
        claim_id: true,
        team_leader_id: true,
        resolution_token_expires_at: true,
        is_active: true,
      },
    });

    if (!team) return res.status(404).json({ ok: false, message: "Token invalide" });

    if (team.resolution_token_expires_at && team.resolution_token_expires_at < new Date()) {
      return res.status(410).json({ ok: false, message: "Token expiré" });
    }

    // Update claim -> resolved
    const updated = await prisma.claims.update({
      where: { id: team.claim_id },
      data: {
        resolution_description: String(resolution_description),
        resolution_submitted_at: new Date(),
        resolution_submitted_by: team.team_leader_id,
        status: "resolved",
        resolved_at: new Date(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        claim_number: true,
        status: true,
        resolution_submitted_at: true,
      },
    });

    // Optionnel : marquer l'équipe complétée
    await prisma.intervention_teams.update({
      where: { id: team.id },
      data: { is_active: false, completed_at: new Date() },
    });

    return res.json({ ok: true, message: "Résolution enregistrée", claim: updated });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || "Erreur serveur" });
  }
});

export default router;
