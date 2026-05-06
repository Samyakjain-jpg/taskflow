const BASE = '/api';

const getToken = () => localStorage.getItem('tf_token');

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  signup: (d) => req('POST', '/auth/signup', d),
  login: (d) => req('POST', '/auth/login', d),
  me: () => req('GET', '/auth/me'),

  // Projects
  getProjects: () => req('GET', '/projects'),
  createProject: (d) => req('POST', '/projects', d),
  getProject: (id) => req('GET', `/projects/${id}`),
  updateProject: (id, d) => req('PUT', `/projects/${id}`, d),
  deleteProject: (id) => req('DELETE', `/projects/${id}`),
  addMember: (id, d) => req('POST', `/projects/${id}/members`, d),
  removeMember: (id, uid) => req('DELETE', `/projects/${id}/members/${uid}`),

  // Tasks
  getTasks: (q = {}) => req('GET', `/tasks?${new URLSearchParams(q)}`),
  createTask: (d) => req('POST', '/tasks', d),
  getTask: (id) => req('GET', `/tasks/${id}`),
  updateTask: (id, d) => req('PUT', `/tasks/${id}`, d),
  deleteTask: (id) => req('DELETE', `/tasks/${id}`),
  addComment: (id, d) => req('POST', `/tasks/${id}/comments`, d),

  // Users
  getUsers: () => req('GET', '/users'),
  getStats: () => req('GET', '/users/stats'),
  updateUserRole: (id, role) => req('PUT', `/users/${id}/role`, { role }),
};
