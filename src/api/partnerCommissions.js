import client from './client';

export const partnerCommissionsAPI = {
  // Partner (authenticated)
  getMyCommissions: (params) => client.get('/partner-commissions/my', { params }),

  // Admin
  getAllCommissions: (params) => client.get('/partner-commissions', { params }),
  getCommissionById: (id) => client.get(`/partner-commissions/${id}`),
  getUserCommissions: (userId, params) =>
    client.get(`/partner-commissions/user/${userId}`, { params }),
  processMonthlyCommissions: (data) => client.post('/partner-commissions/process', data),
  markAsPaid: (id) => client.put(`/partner-commissions/${id}/pay`),
  batchMarkAsPaid: (ids) => client.put('/partner-commissions/batch/pay', { ids }),
};