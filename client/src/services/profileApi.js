import api from './api';

export const getProfile = () => api.get('/profile').then((r) => r.data.data);
export const updateProfile = (payload) => api.put('/profile', payload).then((r) => r.data.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.data);
