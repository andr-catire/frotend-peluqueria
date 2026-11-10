import api from './api.js';

export async function obtenerConfiguracion() {
  const { data } = await api.get('/configuracion');
  return data;
}
