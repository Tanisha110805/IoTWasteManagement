import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const API = `${API_BASE}/api`;

export const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default axios;
