import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

// Lists API
export const listsAPI = {
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  delete: (id) => api.delete(`/lists/${id}`),
  reorder: (lists) => api.put('/lists/reorder/batch', { lists }),
};

// Cards API
export const cardsAPI = {
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  move: (id, data) => api.put(`/cards/${id}/move`, data),
  reorder: (cards) => api.put('/cards/reorder/batch', { cards }),
  archive: (id) => api.put(`/cards/${id}/archive`),
  delete: (id) => api.delete(`/cards/${id}`),
  addLabel: (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { labelId }),
  removeLabel: (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`),
  addMember: (cardId, memberId) => api.post(`/cards/${cardId}/members`, { memberId }),
  removeMember: (cardId, memberId) => api.delete(`/cards/${cardId}/members/${memberId}`),
};

// Labels API
export const labelsAPI = {
  getAll: () => api.get('/labels'),
  create: (data) => api.post('/labels', data),
  update: (id, data) => api.put(`/labels/${id}`, data),
  delete: (id) => api.delete(`/labels/${id}`),
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
};

// Checklists API
export const checklistsAPI = {
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  delete: (id) => api.delete(`/checklists/${id}`),
  addItem: (checklistId, data) => api.post(`/checklists/${checklistId}/items`, data),
  toggleItem: (itemId) => api.put(`/checklists/items/${itemId}/toggle`),
  updateItem: (itemId, data) => api.put(`/checklists/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/checklists/items/${itemId}`),
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

export default api;
