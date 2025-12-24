import api from './api';

export const claimsService = {
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  getActive: () => api.get('/claims/active'),
  submitResolution: (claimId, data) => 
    api.post(`/claims/${claimId}/resolution`, data),
};

export const employeesService = {
  getAll: () => api.get('/employees'),
  getAvailable: (serviceType) => 
    api.get(`/employees/available/${serviceType}`),
  updateStatus: (id, status) => 
    api.patch(`/employees/${id}/status`, { status }),
};

export const teamsService = {
  getActive: () => api.get('/teams/active'),
};