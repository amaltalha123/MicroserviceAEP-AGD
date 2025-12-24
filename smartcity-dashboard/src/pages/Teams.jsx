// src/pages/Teams.jsx
import Layout from '../components/layout/Layout';
import { Users, Calendar, Lightbulb, Trash2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Teams = () => {
  const teams = [
    {
      id: '1',
      claimNumber: 'CLM-2024-00123',
      internalTicket: 'LGT-2024-00045',
      service: 'lighting',
      title: 'Lampadaire éteint Rue Mohammed V',
      location: 'Rue Mohammed V, Marrakech',
      scheduledDate: new Date('2024-12-14'),
      leader: {
        name: 'Ahmed Alami',
        email: 'ahmed.alami@smartcity.ma',
      },
      members: [
        { name: 'Fatima Benali' },
        { name: 'Youssef Tazi' },
      ],
      status: 'active',
      createdAt: new Date('2024-12-14T11:00:00'),
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-00124',
      internalTicket: 'WST-2024-00032',
      service: 'waste',
      title: 'Bac à déchets débordement',
      location: 'Avenue Hassan II, Marrakech',
      scheduledDate: new Date('2024-12-15'),
      leader: {
        name: 'Mohammed Fassi',
        email: 'mohammed.fassi@smartcity.ma',
      },
      members: [
        { name: 'Salma Rachidi' },
        { name: 'Omar Kettani' },
      ],
      status: 'active',
      createdAt: new Date('2024-12-14T09:30:00'),
    },
  ];

  return (
    <Layout title="Équipes d'Intervention" subtitle={`${teams.length} équipe(s) active(s)`}>
      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Équipes Actives</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teams.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Interventions Aujourd'hui</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {teams.filter(t => 
                  format(t.scheduledDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Membres Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teams.length * 3}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des équipes */}
      <div className="space-y-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  team.service === 'lighting' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {team.service === 'lighting' ? (
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Trash2 className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{team.claimNumber}</h3>
                    <span className="text-sm text-gray-500">{team.internalTicket}</span>
                  </div>
                  <p className="text-gray-600">{team.title}</p>
                </div>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                🟢 Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              {/* Chef d'équipe */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Chef d'Équipe</p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="font-semibold text-gray-900">{team.leader.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{team.leader.email}</p>
                </div>
              </div>

              {/* Membres */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Membres</p>
                <div className="space-y-2">
                  {team.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{team.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Prévue le {format(team.scheduledDate, 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Teams;