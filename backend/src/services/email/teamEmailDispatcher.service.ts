import prisma from "../../config/database";
import { mailer } from "./emailClient";
import {
  ClaimInfo,
  memberEmailHtml,
  leaderEmailHtml,
  supervisorEmailHtml,
} from "./emailTemplates";

export class TeamEmailDispatcher {
  async sendAfterTeamAssignment(claimId: string, teamId: string) {
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        claim_number: true,
        internal_ticket_number: true,
        service_type: true,
        priority: true,
        title: true,
        description: true,
        location_address: true,
        location_lat: true,
        location_lng: true,
        user_name: true,
        user_phone: true,
      },
    });
    if (!claim) return;

    const team = await prisma.intervention_teams.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        service_type: true,
        resolution_token: true,
        team_leader_id: true,
        team_supervisor_id: true,
      },
    });
    if (!team) return;

    // Leader
    const leader = await prisma.employees.findUnique({
      where: { id: team.team_leader_id },
      select: { email: true, full_name: true, is_active: true },
    });
    if (!leader?.email || !leader.is_active) return;

    // Supervisor (optionnel)
    const supervisor = team.team_supervisor_id
      ? await prisma.employees.findUnique({
          where: { id: team.team_supervisor_id },
          select: { email: true, full_name: true, is_active: true },
        })
      : null;

    // Membres à notifier (notification_sent=false)
    const membersRows = await prisma.team_members.findMany({
      where: { team_id: teamId, notification_sent: false },
      select: { id: true, is_leader: true, employee_id: true },
    });
    if (membersRows.length === 0) return;

    const memberEmployeeIds = membersRows
      .filter((m) => !m.is_leader)
      .map((m) => m.employee_id);

    const memberEmployees =
      memberEmployeeIds.length > 0
        ? await prisma.employees.findMany({
            where: {
              id: { in: memberEmployeeIds },
              is_active: true,
              email: { not: "" }, // éviter emails vides
            },
            select: { email: true },
          })
        : [];

    const memberEmails = memberEmployees
      .map((e) => e.email)
      .filter((e): e is string => !!e && e.trim().length > 0);

    const claimInfo: ClaimInfo = {
      claimId: claim.id,
      claimNumber: claim.claim_number,
      internalTicket: claim.internal_ticket_number,
      serviceType: claim.service_type,
      priority: claim.priority,
      title: claim.title,
      description: claim.description,
      locationAddress: claim.location_address,
      lat: claim.location_lat ? Number(claim.location_lat) : null,
      lng: claim.location_lng ? Number(claim.location_lng) : null,
      userName: claim.user_name,
      userPhone: claim.user_phone,
    };

    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const base = process.env.FRONT_BASE_URL || "https://sourly-zincoid-shaina.ngrok-free.dev";

    const resolutionLink = `${base}/team/resolve?token=${encodeURIComponent(
      team.resolution_token
    )}`;
    const closureLink = `${base}/supervisor/close?claimId=${encodeURIComponent(
      claim.id
    )}`;

    // 1) Email membres (BCC) + résultat
    let membersOk = false;

    if (memberEmails.length > 0) {
      const subject = `[${String(claim.priority).toUpperCase()}] Claim ${
        claim.claim_number
      } - ${claim.title}`;

      membersOk = await this.sendAndLog({
        claimId: claim.id,
        teamId,
        recipientEmails: memberEmails,
        recipientType: "team_member",
        emailType: "team_member_assignment",
        subject,
        html: memberEmailHtml(claimInfo),
        from,
        bccMode: true,
      });
    }

    // 2) Email leader (infos + lien)
    {
      const subject = `[LEADER] Claim ${claim.claim_number} - Soumettre résolution`;

      await this.sendAndLog({
        claimId: claim.id,
        teamId,
        recipientEmails: [leader.email],
        recipientType: "team_leader",
        emailType: "leader_resolution_link",
        subject,
        html: leaderEmailHtml(claimInfo, resolutionLink),
        from,
        resolutionLink,
        bccMode: false,
      });
    }

    // 3) Email supervisor (seulement lighting + supervisor existe)
    if (claim.service_type === "lighting" && supervisor?.email && supervisor.is_active) {
      const subject = `[SUPERVISOR] Claim ${claim.claim_number} - Clôture`;

      await this.sendAndLog({
        claimId: claim.id,
        teamId,
        recipientEmails: [supervisor.email],
        recipientType: "supervisor",
        emailType: "supervisor_closure_link",
        subject,
        html: supervisorEmailHtml(claimInfo, closureLink),
        from,
        resolutionLink: closureLink,
        bccMode: false,
      });
    }

    //  Mark notified UNIQUEMENT si email membres OK
    if (membersOk) {
      await prisma.team_members.updateMany({
        where: { id: { in: membersRows.map((m) => m.id) } },
        data: { notification_sent: true, notification_sent_at: new Date() },
      });
    }
  }

  private async sendAndLog(args: {
    claimId: string;
    teamId: string;
    recipientEmails: string[];
    recipientType: string;
    emailType: string;
    subject: string;
    html: string;
    from: string;
    resolutionLink?: string;
    bccMode: boolean;
  }): Promise<boolean> {
    const rows = await prisma.$transaction(
      args.recipientEmails.map((email) =>
        prisma.email_notifications.create({
          data: {
            claim_id: args.claimId,
            team_id: args.teamId,
            recipient_email: email,
            recipient_type: args.recipientType,
            email_type: args.emailType,
            subject: args.subject,
            email_body_html: args.html,
            resolution_link: args.resolutionLink ?? null,
            sent: false,
          },
          select: { id: true },
        })
      )
    );

    try {
      await mailer.sendMail({
        from: args.from,
        to: args.bccMode ? args.from : args.recipientEmails[0],
        bcc: args.bccMode ? args.recipientEmails : undefined,
        subject: args.subject,
        html: args.html,
      });

      await prisma.email_notifications.updateMany({
        where: { id: { in: rows.map((r) => r.id) } },
        data: { sent: true, sent_at: new Date(), error_message: null },
      });

      return true;
    } catch (e: any) {
      await prisma.email_notifications.updateMany({
        where: { id: { in: rows.map((r) => r.id) } },
        data: { sent: false, error_message: String(e?.message || e) },
      });

      console.error("Email send failed:", e);
      return false;
    }
  }
}
