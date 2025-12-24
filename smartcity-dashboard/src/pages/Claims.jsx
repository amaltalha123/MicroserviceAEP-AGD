// src/pages/Claims.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [claims, setClaims] = useState([
    {
      id: '1',
      claimNumber: 'CLM-2024-00123',
      internalTicket: 'LGT-2024-00045',
      title: 'Lampadaire éteint Rue Mohammed V',
      qualification: 'Lampadaire éteint',
      priority: 'urgent',
      service: 'lighting',
      status: 'team_assigned',
      location: 'Rue Mohammed V, Marrakech',
      createdAt: new Date('2024-12-14T10:30:00'),
      scheduledDate: new Date('2024-12-14'),
      teamLeader: 'Ahmed Alami',
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-00124',
      internalTicket: 'WST-2024-00032',
      title: 'Bac à déchets débordement',
      qualification: 'Bac à déchets plein',
      priority: 'high',
      service: 'waste',
      status: 'in_progress',
      location: 'Avenue Hassan II, Marrakech',
      createdAt: new Date('2024-12-14T09:15:00'),
      scheduledDate: new Date('2024-12-15'),
      teamLeader: 'Mohammed Fassi',
    },
    {
      id: '3',
      claimNumber: 'CLM-2024-00125',
      internalTicket: 'LGT-2024-00046',
      title: 'Éclairage faible',
      qualification: 'Éclairage faible ou clignotant',
      priority: 'medium',
      service: 'lighting',
      status: 'received',
      location: 'Boulevard Zerktouni, Marrakech',
      createdAt: new Date('2024-12-14T08:00:00'),
      scheduledDate: new Date('2024-12-17'),
      teamLeader: null,
    },
  ]);

  const [filters, setFilters] = useState({
    search: '',
    service: 'all',
    status: 'all',
    priority: 'all',
  });

  const [showFilters, setShowFilters] = useState(false);

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

  const filteredClaims = claims.filter((claim) => {
    const matchSearch = 
      claim.claimNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      claim.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      claim.location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchService = filters.service === 'all' || claim.service === filters.service;
    const matchStatus = filters.status === 'all' || claim.status === filters.status;
    const matchPriority = filters.priority === 'all' || claim.priority === filters.priority;

    return matchSearch && matchService && matchStatus && matchPriority;
  });

  const handleViewDetails = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

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

          {/* Bouton export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
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
                  Qualification
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
              {filteredClaims.map((claim) => (
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
                      {claim.service === 'lighting' ? (
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {claim.service === 'lighting' ? 'Éclairage' : 'Déchets'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{claim.title}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{claim.location}</span>
                      </div>
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
                      <span>{format(claim.createdAt, 'dd/MM/yyyy', { locale: fr })}</span>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Affichage de <span className="font-medium">{filteredClaims.length}</span> réclamation(s)
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Précédent
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Claims;