import client from './client';

export const userPointsAPI = {
  // User
  getMyPoints: () => client.get('/user-points/my'),
  getMyPointHistory: (params) => client.get('/user-points/my/history', { params }),

  // Admin
  getAllPoints: (params) => client.get('/user-points', { params }),
  getUserPoints: (userId) => client.get(`/user-points/user/${userId}`),
  addPoints: (data) => client.post('/user-points', data),
  batchAddPoints: (data) => client.post('/user-points/batch', data),
  deletePointEntry: (id) => client.delete(`/user-points/${id}`),
  expirePoints: (id, expiresAt) => client.put(`/user-points/${id}/expire`, { expiresAt }),
};