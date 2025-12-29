import { TeamEmailDispatcher } from "../src/services/email/teamEmailDispatcher.service";
import prisma from "../src/config/database";

async function main() {
  const claimId = "505af788-0200-49fa-9eb0-a37de7ebd747";
  const teamId = "1da477b2-55ee-47b9-bdf3-af45cf099d8d";

  const dispatcher = new TeamEmailDispatcher();
  await dispatcher.sendAfterTeamAssignment(claimId, teamId);

  console.log("Test terminé : emails déclenchés.");
}

main()
  .catch((e) => {
    console.error(" Erreur test-email:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
