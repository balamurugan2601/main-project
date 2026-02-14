import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable cookies for JWT
});

// --------------- Auth API ---------------

export const register = async (username, password, role) => {
  const response = await api.post('/auth/register', { username, password, role });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get('/auth/check');
  return response.data;
};

// User Management (HQ)
export const getPendingUsers = async () => {
  const response = await api.get('/users/pending');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const approveUser = async (userId) => {
  const response = await api.put(`/users/${userId}/approve`);
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await api.put(`/users/${userId}/reject`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// --------------- Group API ---------------

export const fetchGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const fetchGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

// Group Management (HQ)
export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const updateGroup = async (groupId, name) => {
  const response = await api.put(`/groups/${groupId}`, { name });
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const addMemberToGroup = async (groupId, userId) => {
  const response = await api.put(`/groups/${groupId}/members`, { userId });
  return response.data;
};

// --------------- Message API ---------------

export const fetchMessages = async (groupId, page = 1, limit = 50) => {
  const response = await api.get(`/groups/${groupId}/messages`, {
    params: { page, limit },
  });
  return response.data;
};

export const sendMessage = async (groupId, encryptedText) => {
  const response = await api.post(`/groups/${groupId}/messages`, { encryptedText });
  return response.data;
};

// --------------- Admin API ---------------

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getRecentMessages = async (limit = 10) => {
  const response = await api.get('/admin/recent-messages', {
    params: { limit },
  });
  return response.data;
};

export default api;

