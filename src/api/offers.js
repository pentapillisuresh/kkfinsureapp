import client from './client';

export const offersAPI = {
  // User (view active)
  getActiveOffers: () => client.get('/offers'),
  getOfferById: (id) => client.get(`/offers/${id}`),

  // Admin
  createOffer: (data) => client.post('/offers', data),
  updateOffer: (id, data) => client.put(`/offers/${id}`, data),
  toggleOfferStatus: (id) => client.patch(`/offers/${id}/status`),
  deleteOffer: (id) => client.delete(`/offers/${id}`),
  applyOfferToReferral: (data) => client.post('/offers/apply', data),
};