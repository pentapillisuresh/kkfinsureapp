import client from './client';

export const ticketsAPI = {
  // User
  getMyTickets: (params) => client.get('/tickets/my', { params }),
  getMyTicketById: (id) => client.get(`/tickets/my/${id}`),
  createTicket: (data) => client.post('/tickets', data),

  // Admin
  getAllTickets: (params) => client.get('/tickets', { params }),
  getTicketDetails: (id) => client.get(`/tickets/${id}`),
  updateTicketStatus: (id, status) => client.put(`/tickets/${id}/status`, { status }),
  addResolution: (id, resolution) => client.put(`/tickets/${id}/resolution`, { resolution }),
};