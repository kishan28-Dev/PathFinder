import api from './api';

export const adminListCareers = () => api.get('/admin/careers').then((r) => r.data.data);
export const adminCreateCareer = (payload) => api.post('/admin/careers', payload).then((r) => r.data.data);
export const adminDeleteCareer = (id) => api.delete(`/admin/careers/${id}`).then((r) => r.data.data);

export const adminListSkills = () => api.get('/admin/skills').then((r) => r.data.data);
export const adminCreateSkill = (payload) => api.post('/admin/skills', payload).then((r) => r.data.data);
export const adminDeleteSkill = (id) => api.delete(`/admin/skills/${id}`).then((r) => r.data.data);

export const adminListResources = () => api.get('/admin/resources').then((r) => r.data.data);
export const adminCreateResource = (payload) => api.post('/admin/resources', payload).then((r) => r.data.data);
export const adminDeleteResource = (id) => api.delete(`/admin/resources/${id}`).then((r) => r.data.data);
