import { Router } from "express";
import prisma from "../config/database";

const router = Router();

/**
 * GET /api/supervisor/claim/:claimId
 * Affiche la claim + résolution
 */
router.get("/claim/:claimId", async (req, res) => {
  try {
    const claimId = String(req.params.claimId || "");
    if (!claimId) return res.status(400).json({ ok: false, message: "claimId requis" });

    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
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
        requires_supervisor_validation: true,
      },
    });

    if (!claim) return res.status(404).json({ ok: false, message: "Claim introuvable" });

    return res.json({ ok: true, claim });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || "Erreur serveur" });
  }
});

/**
 * POST /api/supervisor/close
 * Body: { claimId }
 * Clôture finale -> claim.status = "closed"
 */
router.post("/close", async (req, res) => {
  try {
    const { claimId } = req.body || {};
    if (!claimId) return res.status(400).json({ ok: false, message: "claimId requis" });

    const claim = await prisma.claims.findUnique({
      where: { id: String(claimId) },
      select: {
        id: true,
        status: true,
        service_type: true,
        requires_supervisor_validation: true,
      },
    });

    if (!claim) return res.status(404).json({ ok: false, message: "Claim introuvable" });

    // Si tu veux limiter la clôture superviseur à lighting seulement :
    if (claim.service_type !== "lighting") {
      return res.status(403).json({ ok: false, message: "Clôture superviseur réservée au service lighting" });
    }

    // On clôture seulement si déjà resolved
    if (claim.status !== "resolved") {
      return res.status(400).json({
        ok: false,
        message: `Impossible de clôturer: status actuel = ${claim.status} (attendu: resolved)`,
      });
    }

    const updated = await prisma.claims.update({
      where: { id: claim.id },
      data: {
        status: "closed",
        updated_at: new Date(),
      },
      select: { id: true, status: true },
    });

    return res.json({ ok: true, message: "Claim clôturée", claim: updated });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || "Erreur serveur" });
  }
});

export default router;
