import api from './api';

export const generateRoadmap = () => api.post('/roadmap/generate').then((r) => r.data.data);
export const getRoadmap = () => api.get('/roadmap').then((r) => r.data.data);
export const updateRoadmapProgress = (payload) => api.put('/roadmap/progress', payload).then((r) => r.data.data);
