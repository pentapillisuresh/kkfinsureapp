import client from './client';

export const balanceSheetsAPI = {
  // User
  getMyBalanceSheets: (params) => client.get('/balance-sheets/my', { params }),
  getMyBalanceSheetById: (id) => client.get(`/balance-sheets/my/${id}`),

  // Admin
  getUserBalanceSheets: (userId, params) =>
    client.get(`/balance-sheets/user/${userId}`, { params }),
  getUserBalanceSheetById: (userId, id) =>
    client.get(`/balance-sheets/user/${userId}/${id}`),
  generateBalanceSheet: (data) => client.post(`/balance-sheets/my/generate/`, data),
};