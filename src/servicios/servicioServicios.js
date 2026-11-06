import api from './api.js';
import { agregarServicioMock, serviciosMock } from './simulados/servicios.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Lista los servicios activos. La usa VistaServiciosAdministracion. */
export async function listar() {
  if (USAR_MOCKS) return serviciosMock.map((servicio) => ({ ...servicio }));

  const { data } = await api.get('/servicios');
  return data;
}

/** Crea un servicio. La usa ModalServicio. */
export async function crear(datos) {
  if (USAR_MOCKS) return agregarServicioMock(datos);

  const { data } = await api.post('/servicios', datos);
  return data;
}
