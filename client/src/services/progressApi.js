import api from './api';

export const getProgress = () => api.get('/progress').then((r) => r.data.data);
export const updateProgress = (payload) => api.put('/progress', payload).then((r) => r.data.data);
