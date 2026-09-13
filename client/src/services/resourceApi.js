import api from './api';

export const getResources = (params) => api.get('/resources', { params }).then((r) => r.data.data);
export const getRecommendedResources = () => api.get('/resources/recommended').then((r) => r.data.data);
