// src/pages/Claims.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';

import { 
  Search, 
  Filter, 
  Download, 
  Lightbulb, 
  Trash2,
  MapPin,
  Calendar,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Claims = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ CORRECTION 1 : Garder cette ligne
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    service: 'all',
    status: 'all',
    priority: 'all',
  });

  const [showFilters, setShowFilters] = useState(false);

  // ✅ Premier useEffect : Vérification du token SSO
  useEffect(() => {
    const urlToken = params.get("token");
const storedToken = sessionStorage.getItem("B_TOKEN");
const token = urlToken || storedToken;

if (!token) {
  setErrorMsg("Paramètres manquants (token).");
  setLoading(false);
  return;
}

// si token vient de l'URL, on le sauvegarde
if (urlToken) sessionStorage.setItem("B_TOKEN", urlToken);


    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sso/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Erreur SSO:", errorData);
          setErrorMsg("Token invalide ou expiré. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("✅ SSO validé:", data);
        
        sessionStorage.setItem("B_TOKEN", token);
        sessionStorage.setItem("B_USER", JSON.stringify(data));

        setUserInfo(data);
        setLoading(false);

      } catch (e) {
        console.error("Erreur réseau:", e);
        setErrorMsg("Erreur réseau (backend non accessible).");
        setLoading(false);
      }
    })();
  }, [params]);

  // ✅ Deuxième useEffect : Chargement des réclamations (uniquement quand userInfo existe)
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        console.log("📡 Chargement des réclamations pour userId:", userInfo?.userId);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/get-user-claims`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userInfo?.userId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Erreur API claims');
        }

        const result = await response.json();
        console.log('✅ Réclamations chargées:', result.data);
        
        const mappedClaims = result.data.map((c) => ({
          id: c.id,
          claimNumber: c.claimNumber ?? '',
          internalTicket: c.internalTicket ?? '',
          title: c.title ?? '',
          priority: c.priority ?? 'medium',
          service: c.service ?? '',
          status: c.status,
          location: c.location ?? '',
          createdAt: new Date(c.createdAt),
          scheduledDate: c.scheduledDate ? new Date(c.scheduledDate) : null,
          teamLeader: c.teamLeader ?? null,
        }));

        setClaims(mappedClaims);
      } catch (error) {
        console.error('❌ Erreur chargement des réclamations:', error);
        setErrorMsg("Impossible de charger les réclamations.");
      } finally {
        setLoading(false);
      }
    };

    // ✅ CORRECTION 2 : Ne charger que si userInfo et userId existent
    if (userInfo?.userId) {
      fetchClaims();
    }
  }, [userInfo]);

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[priority] || badges.medium;
  };

  const getStatusBadge = (status) => {
    const badges = {
      received: 'bg-gray-100 text-gray-800 border-gray-200',
      team_assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status] || badges.received;
  };

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Reçue',
      team_assigned: 'Équipe assignée',
      in_progress: 'En cours',
      resolved: 'Résolue',
      rejected: 'Rejetée',
      closed: 'Fermée',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'Urgent',
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Basse',
    };
    return labels[priority] || priority;
  };

  const getServiceLabel = (service) => {
    const labels = {
      lighting: 'Éclairage Public',
      waste: 'Déchets',
    };
    return labels[service] || 'Service inconnu';
  };

  const filteredClaims = claims.filter((claim) => {
    const search = filters.search.toLowerCase();

    const matchSearch =
      (claim.claimNumber ?? '').toLowerCase().includes(search) ||
      (claim.title ?? '').toLowerCase().includes(search) ||
      (claim.location ?? '').toLowerCase().includes(search);

    const matchService =
      filters.service === 'all' || claim.service === filters.service;

    const matchStatus =
      filters.status === 'all' || claim.status === filters.status;

    const matchPriority =
      filters.priority === 'all' || claim.priority === filters.priority;

    return matchSearch && matchService && matchStatus && matchPriority;
  });

  const handleViewDetails = (claimId) => {
    const token = sessionStorage.getItem("B_TOKEN");
navigate(`/claims/${claimId}${token ? `?token=${encodeURIComponent(token)}` : ""}`);

  };

  // ✅ CORRECTION 3 : Afficher un message d'erreur si nécessaire
  if (errorMsg) {
    return (
      <Layout title="Erreur">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errorMsg}</p>
        
          <button
            onClick={() => {
              const portal = import.meta.env.VITE_URL_FRONT_PORTAIL;
              window.location.href = `${portal}/sign-in`;
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retour à la connexion
          </button>

        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Réclamations">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des réclamations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Réclamations" 
      subtitle={`${filteredClaims.length} réclamation(s) trouvée(s)`}
    >
      {/* Barre d'actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro, titre ou adresse..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <option value="all">Tous les services</option>
                <option value="lighting">💡 Éclairage Public</option>
                <option value="waste">🗑️ Déchets</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Tous les statuts</option>
                <option value="received">Reçue</option>
                <option value="team_assigned">Équipe assignée</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolue</option>
                <option value="closed">Fermée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="all">Toutes les priorités</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 Élevée</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="low">🟢 Basse</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table des réclamations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucune réclamation trouvée
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr 
                    key={claim.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(claim.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{claim.claimNumber}</p>
                        <p className="text-sm text-gray-500">{claim.internalTicket}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {claim.service === "lighting" ? (
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                          </div>
                        ) : claim.service === "waste" ? (
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-green-600" />
                          </div>
                        ) : null}
                        <span className="text-sm text-gray-700">{getServiceLabel(claim.service)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(claim.status)}`}>
                        {getStatusLabel(claim.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(claim.priority)}`}>
                        {getPriorityLabel(claim.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(claim.createdAt, 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(claim.id);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Claims;