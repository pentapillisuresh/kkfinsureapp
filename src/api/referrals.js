import client from './client';

export const referralsAPI = {
  // User
  getMyReferrals: (params) => client.get('/referrals/my', { params }),
  getMyReferralStats: () => client.get('/referrals/my/stats'),
  createReferral: (data) => client.post('/referrals', data),

  // Admin
  getAllReferrals: (params) => client.get('/referrals', { params }),
  getReferralDetails: (id) => client.get(`/referrals/${id}`),
  getUserReferrals: (userId, params) => client.get(`/referrals/user/${userId}`, { params }),
  updateReferralReward: (id, data) => client.put(`/referrals/${id}/reward`, data),
  deleteReferral: (id) => client.delete(`/referrals/${id}`),
};