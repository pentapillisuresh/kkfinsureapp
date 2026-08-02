import client from './client';

export const investmentsAPI = {
  // User
  getMyInvestments: (params) => client.get('/investments/my', { params }),
  getMyInvestmentById: (id) => client.get(`/investments/my/${id}`),

  // Admin
  createInvestment: (data) => client.post('/investments', data),
  updateInvestment: (id, data) => client.put(`/investments/${id}`, data),
  deleteInvestment: (id) => client.delete(`/investments/${id}`),
  getAllInvestments: (params) => client.get('/investments', { params }),
  getInvestmentDetails: (id) => client.get(`/investments/${id}`),
  uploadInvestmentDocs: (id, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    return client.post(`/investments/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};