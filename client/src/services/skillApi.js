import api from './api';

export const getSkills = (params) => api.get('/skills', { params }).then((r) => r.data.data);
