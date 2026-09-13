import api from './api';

export const getCareers = (params) => api.get('/careers', { params }).then((r) => r.data.data);
export const getCareerBySlug = (slug) => api.get(`/careers/${slug}`).then((r) => r.data.data);
export const recommendCareer = (payload) => api.post('/careers/recommend', payload).then((r) => r.data.data);
