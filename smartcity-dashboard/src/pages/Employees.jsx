// src/pages/Employees.jsx
import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Search, UserPlus, Mail, Phone, Lightbulb, Trash2, TrendingUp } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([
    {
      id: '1',
      employeeNumber: 'EMP-LGT-001',
      name: 'Ahmed Alami',
      email: 'ahmed.alami@smartcity.ma',
      phone: '+212 600 111 111',
      service: 'lighting',
      status: 'available',
      totalInterventions: 45,
      currentClaims: 0,
    },
    {
      id: '2',
      employeeNumber: 'EMP-LGT-002',
      name: 'Fatima Benali',
      email: 'fatima.benali@smartcity.ma',
      phone: '+212 600 222 222',
      service: 'lighting',
      status: 'unavailable',
      totalInterventions: 38,
      currentClaims: 1,
    },
    {
      id: '3',
      employeeNumber: 'EMP-WST-001',
      name: 'Mohammed Fassi',
      email: 'mohammed.fassi@smartcity.ma',
      phone: '+212 600 666 666',
      service: 'waste',
      status: 'unavailable',
      totalInterventions: 52,
      currentClaims: 2,
    },
    {
      id: '4',
      employeeNumber: 'EMP-WST-002',
      name: 'Salma Rachidi',
      email: 'salma.rachidi@smartcity.ma',
      phone: '+212 600 777 777',
      service: 'waste',
      status: 'available',
      totalInterventions: 41,
      currentClaims: 0,
    },
  ]);

  const [filters, setFilters] = useState({
    search: '',
    service: 'all',
    status: 'all',
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = 
      emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchService = filters.service === 'all' || emp.service === filters.service;
    const matchStatus = filters.status === 'all' || emp.status === filters.status;

    return matchSearch && matchService && matchStatus;
  });

  return (
    <Layout 
      title="Employés" 
      subtitle={`${filteredEmployees.length} employé(s) trouvé(s)`}
    >
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {employees.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disponibles</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {employees.filter(e => e.status === 'available').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Éclairage</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {employees.filter(e => e.service === 'lighting').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Déchets</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {employees.filter(e => e.service === 'waste').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.service}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          >
            <option value="all">Tous les services</option>
            <option value="lighting">💡 Éclairage</option>
            <option value="waste">🗑️ Déchets</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Tous les statuts</option>
            <option value="available">🟢 Disponible</option>
            <option value="unavailable">🔴 Indisponible</option>
          </select>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.employeeNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {employee.service === 'lighting' ? (
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                <Mail className="w-4 h-4" />
                <span>{employee.email}</span>
              </a>
              <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                <Phone className="w-4 h-4" />
                <span>{employee.phone}</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{employee.totalInterventions}</p>
                <p className="text-xs text-gray-500">Interventions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{employee.currentClaims}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  employee.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'available' ? '🟢 Disponible' : '🔴 Indispo.'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Employees;