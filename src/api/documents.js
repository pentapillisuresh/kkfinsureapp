import client from './client';

export const documentsAPI = {
  // User
  getMyDocuments: (params) => client.get('/documents/my', { params }),

  // Admin
  uploadDocument: (data) => {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);
    if (data.userId) formData.append('userId', data.userId);
    if (data.type) formData.append('type', data.type);
    if (data.title) formData.append('title', data.title);
    return client.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAllDocuments: (params) => client.get('/documents', { params }),
  getDocumentById: (id) => client.get(`/documents/${id}`),
  getUserDocuments: (userId) => client.get(`/documents/user/${userId}`),
  updateDocument: (id, data) => client.put(`/documents/${id}`, data),
  deleteDocument: (id) => client.delete(`/documents/${id}`),
};