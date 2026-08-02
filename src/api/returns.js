import client from './client';

export const returnsAPI = {
  // User
  getMyReturns: (params) => client.get('/returns/my', { params }),
  getMyReturnSummary: () => client.get('/returns/my/summary'),

  // Admin
  getAllReturns: (params) => client.get('/returns', { params }),
  getUserReturns: (userId, params) => client.get(`/returns/user/${userId}`, { params }),
  getReturnById: (id) => client.get(`/returns/${id}`),
  generateReturns: (data) => client.post('/returns/generate', data),
  generateAnnualBonuses: (data) => client.post('/returns/generate/annual-bonus', data),
  markReturnAsPaid: (id) => client.put(`/returns/${id}/pay`),
  batchMarkReturnsAsPaid: (ids) => client.put('/returns/batch/pay', { ids }),
};