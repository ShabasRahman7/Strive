import axios from 'axios';

const api = axios.create({
  baseURL: 'https://strive-backend-nv40.onrender.com',
});

export default api;