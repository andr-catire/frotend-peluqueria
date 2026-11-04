import api from './api.js';
import { configuracionMock } from './mocks/configuracion.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function obtenerConfiguracion() {
  if (USAR_MOCKS) return { ...configuracionMock };

  const { data } = await api.get('/configuracion');
  return data;
}
