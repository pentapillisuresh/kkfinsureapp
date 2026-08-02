import client from './client';

export const userAPI = {
  getProfile: () => client.get('/users/profile'),
  getUserDashboard: () => client.get('/users/Dashboard'),
  getInvestments: (params) => client.get('/users/investments', { params }),
  getBalanceSheet: (params) => client.get('/users/balance-sheet', { params }),
  getDocuments: (params) => client.get('/users/documents', { params }),
  getReturns: (params) => client.get('/users/returns', { params }),
  getReferrals: (params) => client.get('/users/referrals', { params }),
  getPoints: () => client.get('/users/points'),
  createTicket: (data) => client.post('/users/ticket', data),
  getTickets: (params) => client.get('/users/tickets', { params }),
};