import client from './client';

export const filesAPI = {
  // Admin only – upload single file
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/files/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Admin only – upload multiple files
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return client.post('/files/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Download file (authenticated)
  downloadFile: (filename) => client.get(`/files/${filename}`, { responseType: 'blob' }),
};