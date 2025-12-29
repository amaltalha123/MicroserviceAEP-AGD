export type ClaimInfo = {
  claimId: string;
  claimNumber: string;
  internalTicket?: string | null;

  serviceType: "lighting" | "waste";
  priority: string;

  title: string;
  description?: string | null;

  locationAddress?: string | null;
  lat?: number | null;
  lng?: number | null;

  userName?: string | null;
  userPhone?: string | null;
};

function mapsLink(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function commonBlock(c: ClaimInfo) {
  const m = mapsLink(c.lat, c.lng);
  const ticketRef = c.internalTicket || c.claimNumber;

  return `
    <p><b>Référence :</b> ${ticketRef}</p>
    <p><b>Service :</b> ${c.serviceType}</p>
    <p><b>Priorité :</b> ${c.priority}</p>
    <p><b>Titre :</b> ${c.title}</p>
    <p><b>Description :</b> ${c.description ?? "-"}</p>
    <hr/>
    <h3>Localisation</h3>
    <p><b>Adresse :</b> ${c.locationAddress ?? "-"}</p>
    ${m ? `<p><a href="${m}">Ouvrir Google Maps</a></p>` : ""}
    <hr/>
    <h3>Contact</h3>
    <p><b>Nom :</b> ${c.userName ?? "-"}</p>
    <p><b>Téléphone :</b> ${c.userPhone ?? "-"}</p>
  `;
}

export function memberEmailHtml(c: ClaimInfo) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Nouvelle réclamation à traiter</h2>
    ${commonBlock(c)}
    <p>Merci de prendre en charge cette réclamation.</p>
  </div>`;
}

export function leaderEmailHtml(c: ClaimInfo, resolutionLink: string) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Réclamation assignée (Chef d’équipe)</h2>
    ${commonBlock(c)}
    <hr/>
    <p><b>Soumettre / confirmer la résolution :</b></p>
    <p><a href="${resolutionLink}">Accéder au formulaire de résolution</a></p>
  </div>`;
}

export function supervisorEmailHtml(c: ClaimInfo, closureLink: string) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Réclamation à clôturer (Supervisor)</h2>
    ${commonBlock(c)}
    <hr/>
    <p><b>Clôturer la réclamation :</b></p>
    <p><a href="${closureLink}">Accéder au formulaire de clôture</a></p>
  </div>`;
}
