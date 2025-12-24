// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Lightbulb, 
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    urgent: 12,
    inProgress: 45,
    resolved: 234,
    lighting: 67,
    waste: 89,
  });

  const [recentClaims, setRecentClaims] = useState([
    {
      id: '1',
      claimNumber: 'CLM-2024-00123',
      title: 'Lampadaire éteint Rue Mohammed V',
      priority: 'urgent',
      service: 'lighting',
      status: 'team_assigned',
      createdAt: new Date(),
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-00124',
      title: 'Bac à déchets débordement',
      priority: 'high',
      service: 'waste',
      status: 'in_progress',
      createdAt: new Date(),
    },
    {
      id: '3',
      claimNumber: 'CLM-2024-00125',
      title: 'Éclairage faible Avenue Hassan II',
      priority: 'medium',
      service: 'lighting',
      status: 'received',
      createdAt: new Date(),
    },
  ]);

  const chartData = [
    { date: '08/12', claims: 12 },
    { date: '09/12', claims: 19 },
    { date: '10/12', claims: 15 },
    { date: '11/12', claims: 25 },
    { date: '12/12', claims: 22 },
    { date: '13/12', claims: 18 },
    { date: '14/12', claims: 28 },
  ];

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return badges[priority] || badges.medium;
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

  return (
    <Layout title="Dashboard" subtitle="Vue d'ensemble des réclamations">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Urgent */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              +3
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.urgent}</h3>
          <p className="text-sm text-gray-500 mt-1">Réclamations urgentes</p>
        </div>

        {/* En cours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              +12
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.inProgress}</h3>
          <p className="text-sm text-gray-500 mt-1">En cours de traitement</p>
        </div>

        {/* Résolues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              +45
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.resolved}</h3>
          <p className="text-sm text-gray-500 mt-1">Résolues ce mois</p>
        </div>

        {/* Équipes actives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">8</h3>
          <p className="text-sm text-gray-500 mt-1">Équipes actives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Par Service
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Éclairage Public</p>
                  <p className="text-sm text-gray-500">43% du total</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.lighting}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Déchets</p>
                  <p className="text-sm text-gray-500">57% du total</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.waste}</span>
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Évolution des réclamations
            </h3>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+12.5%</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="claims" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Réclamations récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Réclamations Récentes
            </h3>
            <a href="/claims" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir tout →
            </a>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentClaims.map((claim) => (
            <div key={claim.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    claim.service === 'lighting' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {claim.service === 'lighting' ? (
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <Trash2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {claim.claimNumber}
                      </span>
                      <span className={`badge ${getPriorityBadge(claim.priority)}`}>
                        {claim.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{claim.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(claim.createdAt, 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getStatusLabel(claim.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;