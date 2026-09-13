import api from './api';

export const sendMentorMessage = (message) => api.post('/mentor/chat', { message }).then((r) => r.data.data);
export const getMentorHistory = () => api.get('/mentor/history').then((r) => r.data.data);
