import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";


export default function TeamResolvePage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token"), [params]);

  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Token manquant dans l’URL. Vérifie le lien reçu par email.");
      setLoading(false);
      return;
    }

   (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
          `https://localhost:3001/api/team/resolve-info?token=${encodeURIComponent(token)}`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Vérifier si la réponse est bien du JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('La réponse du serveur n\'est pas au format JSON. Vérifie que l\'API fonctionne correctement.');
        }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Erreur lors du chargement");
        setClaim(data.claim);
      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Token manquant.");
      return;
    }

    try {
      const res = await fetch(`https://localhost:3001/api/team/resolve`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          token,
          resolution_description: resolutionDescription,
        }),
      });

      // Vérifier si la réponse est bien du JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON. Vérifie que l\'API fonctionne correctement.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur lors de l’envoi");
      setSuccessMsg("Résolution envoyée. Le supervisor pourra clôturer la réclamation.");
      // Optionnel : vider
      // setResolutionDescription("");
    } catch (e) {
      setErrorMsg(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Confirmation de résolution — Leader
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Page de validation de la résolution (lien reçu par email).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {!token && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Token manquant dans l’URL.
            </div>
          )}

          {loading && (
            <div className="text-sm text-slate-600">Chargement...</div>
          )}

          {!loading && errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {!loading && successMsg && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}

          {!loading && claim && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex flex-col gap-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Claim :</span>{" "}
                  <span className="text-slate-900">{claim.claim_number}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Titre :</span>{" "}
                  <span className="text-slate-900">{claim.title}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-slate-700">Priorité :</span>{" "}
                    <span className="text-slate-900">{claim.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Service :</span>{" "}
                    <span className="text-slate-900">{claim.service_type}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Adresse :</span>{" "}
                  <span className="text-slate-900">{claim.location_address}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5">
            <label className="block text-sm font-medium text-slate-700">
              Description de la résolution
            </label>
            <textarea
              value={resolutionDescription}
              onChange={(e) => setResolutionDescription(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Décris ce qui a été fait, pièces changées, actions, photos, etc."
              required
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Soumettre la résolution
              </button>

              <Link
                to="/"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Retour
              </Link>
            </div>
          </form>
        </div>

        
      </div>
    </div>
  );
}
