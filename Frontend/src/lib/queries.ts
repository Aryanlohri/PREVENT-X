import api from './api';

export const fetchVitals = async () => {
    const response = await api.get('/api/vitals/');
    return response.data;
};

export const createVital = async (vitalData: any) => {
    const response = await api.post('/api/vitals/', vitalData);
    return response.data;
};


export const fetchDailyLogs = async () => {
    const response = await api.get('/api/daily-logs/');
    return response.data;
};

export const createDailyLog = async (logData: any) => {
    const response = await api.post('/api/daily-logs/', logData);
    return response.data;
};

export const sendChatMessage = async (messages: { role: string, content: string }[]) => {
    const response = await api.post('/api/chat/', { messages });
    return response.data;
};

export const predictHealthRisk = async () => {
    const response = await api.get('/api/ml/predict-risk', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const fetchUserProfile = async () => {
    const response = await api.get('/api/users/me');
    return response.data;
};

export const updateUserProfile = async (userData: any) => {
    const response = await api.put('/api/users/me', userData);
    return response.data;
};

export const predictDisease = async (symptoms: string[]) => {
    const response = await api.post('/api/ml/predict-disease', { symptoms }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const fetchLifestylePlan = async () => {
    const response = await api.get('/api/ml/my-lifestyle-plan', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
