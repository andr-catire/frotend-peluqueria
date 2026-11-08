import api from './api.js';
import { listarEmpleadosMock, registrarEmpleadoMock } from './simulados/personal.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Lista los estilistas activos. La usa VistaPersonalAdministracion. */
export async function listar() {
  if (USAR_MOCKS) return listarEmpleadosMock();

  const { data } = await api.get('/personal');
  return data;
}

/** Registra una cuenta de estilista. La usa ModalEstilista. */
export async function registrar(datos) {
  if (USAR_MOCKS) return registrarEmpleadoMock(datos);

  const { data } = await api.post('/personal', datos);
  return data;
}
