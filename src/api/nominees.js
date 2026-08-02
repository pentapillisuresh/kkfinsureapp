import client from './client';

export const nomineesAPI = {
  // User
  getMyNominee: () => client.get('/nominees/my'),

  // Admin
  createNominee: (data) => client.post('/nominees', data),
  getAllNominees: () => client.get('/nominees'),
  getNomineeById: (id) => client.get(`/nominees/${id}`),
  updateNominee: (id, data) => client.put(`/nominees/${id}`, data),
  deleteNominee: (id) => client.delete(`/nominees/${id}`),
  linkNomineeToUser: (userId, nomineeId) =>
    client.put(`/nominees/user/${userId}/nominee`, { nomineeId }),
};