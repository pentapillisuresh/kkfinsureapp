import client from './client';

export const adminAPI = {
  // User management
  getAllUsers: (params) => client.get('/admin/users', { params }),
  getUserDetails: (userId) => client.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => client.put(`/admin/users/${userId}`, data),
  toggleUserStatus: (userId) => client.put(`/admin/users/${userId}/status`),

  // Dashboard
  getDashboardStats: () => client.get('/admin/dashboard/stats'),

  // DPC approval
  approveDPC: (investmentId) => client.put(`/admin/investments/${investmentId}/dpc`),

  // Company documents
  uploadCompanyDocument: (data) =>
    client.post('/admin/company-documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCompanyDocuments: () => client.get('/admin/company-documents'),
  deleteCompanyDocument: (docId) => client.delete(`/admin/company-documents/${docId}`),

  // Generate balance sheet for any user
  generateBalanceSheet: (data) => client.post('/admin/balance-sheet/generate', data),
};