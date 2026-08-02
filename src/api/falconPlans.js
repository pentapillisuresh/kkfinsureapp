import client from './client';

export const falconPlansAPI = {
  // Public (authenticated)
  getAllPlans: (params) => client.get('/falcon-plans', { params }),
  getPlanById: (id) => client.get(`/falcon-plans/${id}`),

  // Admin only
  createPlan: (data) => client.post('/falcon-plans', data),
  updatePlan: (id, data) => client.put(`/falcon-plans/${id}`, data),
  togglePlanStatus: (id) => client.patch(`/falcon-plans/${id}/status`),
  deletePlan: (id) => client.delete(`/falcon-plans/${id}`),
};