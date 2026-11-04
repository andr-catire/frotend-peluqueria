import api from './api.js';

export async function obtenerEstado() {
  const { data } = await api.get('/health');
  return data;
}
