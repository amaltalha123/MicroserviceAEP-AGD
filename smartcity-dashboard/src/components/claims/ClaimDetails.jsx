// src/pages/ClaimDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Users,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Lightbulb,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState({
    id: '1',
    claimNumber: 'CLM-2024-00123',
    internalTicket: 'LGT-2024-00045',
    title: 'Lampadaire éteint Rue Mohammed V',
    description: 'Le lampadaire ne fonctionne plus depuis 3 jours. C\'est dangereux la nuit car c\'est une zone de passage piéton.',
    priority: 'urgent',
    service: 'lighting',
    status: 'in_progress',
    location: {
      address: 'Rue Mohammed V, Marrakech',
      lat: 31.6295,
      lng: -7.9811,
    },
    team: {
      id: 'team_1',
      leader: {
        id: 'emp_1',
        name: 'Ahmed Alami',
        email: 'ahmed.alami@smartcity.ma',
      },
      //Only members when it is lighting service
      Supervisor: {
        id: 'sup_1',
        name: 'Ahmed Alami',
        email: 'ahmed.alami@smartcity.ma',
      },
      members: [
        { id: 'emp_2', name: 'Fatima Benali', isLeader: false },
        { id: 'emp_3', name: 'Youssef Tazi', isLeader: false },
      ],
    },
    
    
    timeline: [
      {
        id: 1,
        type: 'created',
        description: 'Réclamation créée',
        timestamp: new Date('2024-12-14T10:30:00'),
        actor: 'Système',
      },
      {
        id: 2,
        type: 'team_assigned',
        description: 'Équipe assignée (Ahmed Alami)',
        timestamp: new Date('2024-12-14T11:00:00'),
        actor: 'Système',
      },
      {
        id: 3,
        type: 'status_change',
        description: 'Statut changé: En cours',
        timestamp: new Date('2024-12-14T14:30:00'),
        actor: 'Ahmed Alami',
      },
    ],
    createdAt: new Date('2024-12-14T10:30:00'),
    scheduledDate: new Date('2024-12-14'),
    resolution: null,
  });

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[priority];
  };

  const getStatusBadge = (status) => {
    const badges = {
      received: 'bg-gray-100 text-gray-800',
      team_assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return badges[status];
  };

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Reçue',
      team_assigned: 'Équipe assignée',
      in_progress: 'En cours',
      resolved: 'Résolue',
    };
    return labels[status];
  };

  return (
    <Layout title={claim.claimNumber} subtitle={claim.internalTicket}>
      <button
        onClick={() => navigate('/claims')}
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
                  <h2 className="text-xl font-bold text-gray-900">{claim.title}</h2>
                  <p className="text-sm text-gray-500">
                    {claim.service === 'lighting' ? 'Éclairage Public' : 'Déchets'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className={`badge border ${getPriorityBadge(claim.priority)}`}>
                  {claim.priority}
                </span>
                <span className={`badge ${getStatusBadge(claim.status)}`}>
                  {getStatusLabel(claim.status)}
                </span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{claim.description}</p>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Créée le {format(claim.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Intervention prévue le {format(claim.scheduledDate, 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>

          
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historique
            </h3>
            <div className="space-y-4">
              {claim.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === claim.timeline.length - 1 ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${
                        index === claim.timeline.length - 1 ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    {index < claim.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-gray-900">{event.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(event.timestamp, 'dd MMMM yyyy à HH:mm', { locale: fr })} • {event.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne sidebar */}
        <div className="space-y-6">
          {/* Informations citoyen */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Citoyen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{claim.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${claim.user.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{claim.user.email}</span>
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <a href={`tel:${claim.user.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{claim.user.phone}</span>
                </a>
              </div>
            </div>
          </div> */}

          {/* Équipe assignée */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Équipe Assignée
            </h3>
            
            <div className="space-y-4">
              {/* Chef d'équipe */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Chef d'équipe</p>
                <p className="font-medium text-gray-900">{claim.team.leader.name}</p>
                <p className="text-sm text-gray-600">{claim.team.leader.email}</p>
              </div>

              {/* Membres */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Membres</p>
                <div className="space-y-2">
                  {claim.team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
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
          </div>

          {/* Actions rapides */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="w-4 h-4" />
                Exporter PDF
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-4 h-4" />
                Contacter le citoyen
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default ClaimDetail;