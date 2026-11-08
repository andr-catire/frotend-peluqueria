import api from './api.js';
import {
  obtenerHoyMock,
  registrarEntradaMock,
  registrarSalidaMock,
} from './simulados/asistencia.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Estado de la jornada de hoy del empleado autenticado. La usa VistaAsistencia. */
export async function obtenerHoy() {
  if (USAR_MOCKS) return obtenerHoyMock();

  const { data } = await api.get('/asistencia/hoy');
  return data;
}

/** Registra la entrada del día. La hora la decide el servidor. */
export async function registrarEntrada() {
  if (USAR_MOCKS) return registrarEntradaMock();

  const { data } = await api.post('/asistencia/entrada');
  return data;
}

/** Registra la salida; el motivo solo se envía cuando es anticipada. */
export async function registrarSalida(motivo) {
  if (USAR_MOCKS) return registrarSalidaMock(motivo);

  const { data } = await api.post('/asistencia/salida', { motivo: motivo ?? null });
  return data;
}
