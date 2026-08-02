import client from './client';

export const partnerTiersAPI = {
  // Any authenticated user
  getActiveTiers: () => client.get('/partner-tiers'),
  getTierById: (id) => client.get(`/partner-tiers/${id}`),

  // Admin
  createTier: (data) => client.post('/partner-tiers', data),
  updateTier: (id, data) => client.put(`/partner-tiers/${id}`, data),
  toggleTierStatus: (id) => client.patch(`/partner-tiers/${id}/status`),
  deleteTier: (id) => client.delete(`/partner-tiers/${id}`),
  assignTierToUser: (userId, tierName) =>
    client.put(`/partner-tiers/user/${userId}/tier`, { tierName }),
};