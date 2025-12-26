// src/pages/ClaimDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3001";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return badges[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusBadge = (status) => {
    const badges = {
      received: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      team_assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      received: "Reçue",
      assigned: "Équipe assignée",
      team_assigned: "Équipe assignée",
      in_progress: "En cours",
      resolved: "Résolue",
      closed: "Clôturée",
    };
    return labels[status] || status;
  };

  const getServiceLabel = (service) => {
    const labels = {
      lighting: "Éclairage Public",
      waste: "Déchets",
      cleanliness: "Propreté",
      roads: "Voirie",
    };
    return labels[service] || service || "Service";
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("id manquant");

        const res = await fetch(`${API_BASE}/api/claims/${id}`, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} - ${txt || "Erreur API"}`);
        }

        const data = await res.json();

        if (!data?.ok) {
          throw new Error(data?.message || "Réponse API invalide");
        }

        const c = data.claim;

        // mapping backend -> UI
        const mapped = {
          id: c.id,
          claimNumber: c.claim_number,
          internalTicket: c.internal_ticket_number,
          title: c.title,
          description: c.description,
          priority: c.priority,
          service: c.service_type,
          status: c.status,
          location: {
            address: c.location_address,
            lat: c.location_lat,
            lng: c.location_lng,
          },
          createdAt: c.created_at ? new Date(c.created_at) : null,
          scheduledDate: c.intervention_scheduled_date
            ? new Date(c.intervention_scheduled_date)
            : null,

          team: data.team
            ? {
                id: data.team.id,
                leader: data.team.leader
                  ? {
                      id: data.team.leader.id,
                      name: data.team.leader.full_name,
                      email: data.team.leader.email,
                    }
                  : null,
                supervisor: data.team.supervisor
                  ? {
                      id: data.team.supervisor.id,
                      name: data.team.supervisor.full_name,
                      email: data.team.supervisor.email,
                    }
                  : null,
                members: (data.team.members || []).map((m) => ({
                  id: m.id,
                  name: m.name,
                  email: m.email ?? null,
                  isLeader: !!m.isLeader,
                })),
              }
            : null,

          timeline: (data.timeline || []).map((t) => ({
            id: t.id,
            type: t.action_type,
            description: t.action_description,
            timestamp: t.created_at ? new Date(t.created_at) : new Date(),
            actor: t.performed_by_name || "Système",
            previous_status: t.previous_status,
            new_status: t.new_status,
          })),
        };

        setClaim(mapped);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Erreur de chargement");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Chargement..." subtitle="">
        <div className="p-6">Chargement…</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Erreur" subtitle="">
        <div className="p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate("/claims")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux réclamations
          </button>
        </div>
      </Layout>
    );
  }

  if (!claim) return null;

  const isLighting = claim.service === "lighting";

  return (
    <Layout title={claim.claimNumber || "Détail réclamation"} subtitle={claim.internalTicket || ""}>
      <button
        onClick={() => navigate("/claims")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour aux réclamations</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isLighting ? "bg-yellow-100" : "bg-green-100"
                  }`}
                >
                  {isLighting ? (
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Trash2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {claim.title || "—"}
                  </h2>
                  <p className="text-sm text-gray-500">{getServiceLabel(claim.service)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className={`badge border ${getPriorityBadge(claim.priority)}`}>
                  {claim.priority || "—"}
                </span>
                <span className={`badge ${getStatusBadge(claim.status)}`}>
                  {getStatusLabel(claim.status)}
                </span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{claim.description || "—"}</p>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {claim.createdAt
                    ? `Créée le ${format(claim.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}`
                    : "Date de création: —"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {claim.scheduledDate
                    ? `Intervention prévue le ${format(claim.scheduledDate, "dd MMMM yyyy", {
                        locale: fr,
                      })}`
                    : "Intervention prévue: —"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historique
            </h3>

            {claim.timeline?.length ? (
              <div className="space-y-4">
                {claim.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === claim.timeline.length - 1 ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <CheckCircle
                          className={`w-4 h-4 ${
                            index === claim.timeline.length - 1
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      {index < claim.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                      )}
                    </div>

                    <div className="flex-1 pb-6">
                      <p className="font-medium text-gray-900">{event.description || "—"}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.timestamp
                          ? format(event.timestamp, "dd MMMM yyyy à HH:mm", { locale: fr })
                          : "—"}{" "}
                        • {event.actor || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun historique.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Équipe assignée */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Équipe Assignée
            </h3>

            {!claim.team ? (
              <p className="text-sm text-gray-500">Aucune équipe assignée.</p>
            ) : (
              <div className="space-y-4">
                {/* Chef d'équipe */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
                    Chef d&apos;équipe
                  </p>

                  {claim.team.leader ? (
                    <>
                      <p className="font-medium text-gray-900">{claim.team.leader.name}</p>
                      <p className="text-sm text-gray-600">{claim.team.leader.email || "—"}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">—</p>
                  )}
                </div>

                {/* Membres */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Membres</p>
                  {claim.team.members?.length ? (
                    <div className="space-y-2">
                      {claim.team.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              {(member.name || "?")
                                .split(" ")
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {member.name || "Inconnu"}{" "}
                              {member.isLeader ? (
                                <span className="text-xs text-blue-600">(Leader)</span>
                              ) : null}
                            </span>
                            {member.email ? (
                              <span className="text-xs text-gray-500">{member.email}</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun membre.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimDetail;
