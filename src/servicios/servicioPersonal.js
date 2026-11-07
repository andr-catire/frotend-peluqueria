import api from './api.js';
import { buscarEmpleadoMock, promoverEmpleadoMock } from './simulados/personal.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Busca una cuenta CLIENTE por correo. La usa VistaPersonalAdministracion. */
export async function buscarPorEmail(email) {
  if (USAR_MOCKS) return buscarEmpleadoMock(email);

  const { data } = await api.get('/personal/buscar', { params: { email } });
  return data;
}

/** Promueve una cuenta a estilista. La usa VistaPersonalAdministracion. */
export async function promover(datos) {
  if (USAR_MOCKS) return promoverEmpleadoMock(datos);

  const { data } = await api.post('/personal/promover', datos);
  return data;
}
