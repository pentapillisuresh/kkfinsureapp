import client from './client';

export const authAPI = {

  // User login
  login: (credentials) => client.post('/auth/login', credentials),

  // Change password (authenticated)
  changePassword: (passwords) => client.put('/auth/change-password', passwords),
};