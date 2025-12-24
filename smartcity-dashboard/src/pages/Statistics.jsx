// src/pages/Statistics.jsx
import Layout from '../components/layout/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';

const Statistics = () => {
  const monthlyData = [
    { month: 'Jan', lighting: 45, waste: 52 },
    { month: 'Fév', lighting: 52, waste: 48 },
    { month: 'Mar', lighting: 48, waste: 55 },
    { month: 'Avr', lighting: 61, waste: 58 },
    { month: 'Mai', lighting: 55, waste: 62 },
    { month: 'Juin', lighting: 67, waste: 65 },
  ];

  const qualificationData = [
    { name: 'Lampadaire éteint', value: 45, color: '#f59e0b' },
    { name: 'Bac débordement', value: 38, color: '#10b981' },
    { name: 'Éclairage faible', value: 25, color: '#fbbf24' },
    { name: 'Dépôt sauvage', value: 22, color: '#22c55e' },
    { name: 'Autres', value: 26, color: '#94a3b8' },
  ];

  const resolutionTimes = [
    { priority: 'Urgent', hours: 4.5 },
    { priority: 'Élevée', hours: 12 },
    { priority: 'Moyenne', hours: 56 },
    { priority: 'Basse', hours: 120 },
  ];

  const topEmployees = [
    { name: 'Ahmed Alami', interventions: 45, satisfaction: 98 },
    { name: 'Mohammed Fassi', interventions: 52, satisfaction: 97 },
    { name: 'Fatima Benali', interventions: 38, satisfaction: 96 },
    { name: 'Salma Rachidi', interventions: 41, satisfaction: 95 },
    { name: 'Youssef Tazi', interventions: 35, satisfaction: 94 },
  ];

  return (
    <Layout title="Statistiques & Rapports" subtitle="Analyse des performances">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              +12.5%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">234</h3>
          <p className="text-sm text-gray-500">Résolues ce mois</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">18h</h3>
          <p className="text-sm text-gray-500">Temps moyen résolution</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">96%</h3>
          <p className="text-sm text-gray-500">Taux de satisfaction</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">10</h3>
          <p className="text-sm text-gray-500">Employés actifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique mensuel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Réclamations par Mois
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lighting" fill="#f59e0b" name="Éclairage" />
              <Bar dataKey="waste" fill="#10b981" name="Déchets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique qualifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Répartition par Qualification
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {qualificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temps de résolution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Temps Moyen de Résolution
          </h3>
          <div className="space-y-4">
            {resolutionTimes.map((item) => (
              <div key={item.priority}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.priority}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.hours < 24 ? `${item.hours}h` : `${Math.round(item.hours / 24)}j`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.hours / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top employés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top 5 Employés
          </h3>
          <div className="space-y-4">
            {topEmployees.map((employee, index) => (
              <div key={employee.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-500">
                    {employee.interventions} interventions • {employee.satisfaction}% satisfaction
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;