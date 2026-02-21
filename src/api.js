import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getToken() {
  return window.localStorage.getItem('chautari-token');
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.localStorage.removeItem('chautari-token');
      window.localStorage.removeItem('chautari-role');
      window.localStorage.removeItem('chautari-user');
    }
    return Promise.reject(err);
  }
);

export const api = {
  auth: {
    login: (email, password) =>
      client.post('/api/auth/login', { email, password }).then((r) => r.data),
    register: (email, password, name) =>
      client.post('/api/auth/register', { email, password, name }).then((r) => r.data),
  },
  users: {
    getMe: () => client.get('/api/users/me').then((r) => r.data),
    updateMe: (data) => client.patch('/api/users/me', data).then((r) => r.data),
  },
  entries: {
    list: () => client.get('/api/entries').then((r) => r.data),
    create: (body, chakraId) =>
      client.post('/api/entries', { body, chakraId }).then((r) => r.data),
    update: (id, data) => client.patch(`/api/entries/${id}`, data).then((r) => r.data),
    delete: (id) => client.delete(`/api/entries/${id}`),
  },
  admin: {
    getEntries: () => client.get('/api/admin/entries').then((r) => r.data),
    deleteEntry: (id) => client.delete(`/api/admin/entries/${id}`),
    updateEntry: (id, data) =>
      client.patch(`/api/admin/entries/${id}`, data).then((r) => r.data),
    getUsers: () => client.get('/api/admin/users').then((r) => r.data),
    updateUser: (id, data) =>
      client.patch(`/api/admin/users/${id}`, data).then((r) => r.data),
    deleteUser: (id) => client.delete(`/api/admin/users/${id}`),
  },
};

export default api;
