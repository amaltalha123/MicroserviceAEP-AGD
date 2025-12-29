import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MapPin,
  Wrench,
  RefreshCw,
  Lock,
} from "lucide-react";


export default function SupervisorClosePage() {
  const [params] = useSearchParams();
  const claimId = useMemo(() => params.get("claimId"), [params]);

  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!claimId) {
      setErrorMsg("claimId manquant dans l'URL. Vérifie le lien reçu par email.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
       `https://localhost:3001/api/supervisor/claim/${encodeURIComponent(claimId)}`,
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
  }, [claimId]);

  async function handleClose() {
    setSuccessMsg("");
    setErrorMsg("");

    if (!claimId) {
      setErrorMsg("claimId manquant.");
      return;
    }

    try {
      const res = await fetch(`https://localhost:3001/api/supervisor/close`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ claimId }),
    });

    // Vérifier si la réponse est bien du JSON
    const contentType = res.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  throw new Error('La réponse du serveur n\'est pas au format JSON. Vérifie que l\'API fonctionne correctement.');
}

const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur clôture");
      setSuccessMsg("✓ Réclamation clôturée avec succès.");
    } catch (e) {
      setErrorMsg(e.message);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      en_attente: "bg-amber-50 text-amber-700 border-amber-200",
      en_cours: "bg-sky-50 text-sky-700 border-sky-200",
      résolu: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cloture: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header clair */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 p-3">
              <Lock className="h-6 w-6 text-sky-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Clôture de Réclamation
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Validation finale par le superviseur
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="text-sm text-red-800">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
            <div className="text-sm font-medium text-emerald-800">
              {successMsg}
            </div>
          </div>
        )}

        {/* Card principale */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-3 text-sm text-gray-600">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : claim ? (
            <div className="p-7 sm:p-8">
              {/* Header claim */}
              <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Numéro de réclamation
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {claim.claim_number}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${getStatusColor(
                    claim.status
                  )}`}
                >
                  {claim.status}
                </span>
              </div>

              {/* Détails */}
              <div className="space-y-5">
                {/* Titre */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Titre de la réclamation
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {claim.title}
                  </p>
                </div>

                {/* Grille */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Type de service
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900">
                      {claim.service_type}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Localisation
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900">
                      {claim.location_address}
                    </p>
                  </div>
                </div>

                {/* Résolution */}
                {claim.resolution_description && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-sky-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wide text-sky-900">
                        Résolution proposée
                      </h3>
                    </div>
                    <p className="leading-relaxed text-gray-800">
                      {claim.resolution_description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <button
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4" />
                  Clôturer définitivement
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.99]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Rafraîchir
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-gray-600">
              Aucune réclamation trouvée.
            </div>
          )}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}
