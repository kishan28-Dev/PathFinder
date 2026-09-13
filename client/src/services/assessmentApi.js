import api from './api';

export const generateAssessment = (payload) => api.post('/assessment/generate', payload).then((r) => r.data.data);
export const submitAssessment = (payload) => api.post('/assessment/submit', payload).then((r) => r.data.data);
export const getAssessmentHistory = () => api.get('/assessment/history').then((r) => r.data.data);
export const getAssessmentById = (id) => api.get(`/assessment/${id}`).then((r) => r.data.data);
