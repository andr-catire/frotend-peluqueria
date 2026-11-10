import api from './api.js';

/** Devuelve el horario vigente del local. La usa el panel ADMIN. */
export async function obtenerHorario() {
  const { data } = await api.get('/asistencia/horario');
  return data;
}

/** Actualiza apertura y cierre. Solo ADMIN. */
export async function actualizarHorario(datos) {
  const { data } = await api.put('/asistencia/horario', datos);
  return data;
}

/** Lista la asistencia de todos los estilistas para una fecha. La usa el panel ADMIN. */
export async function listar(fecha) {
  const { data } = await api.get('/asistencia', {
    params: fecha ? { fecha } : {},
  });
  return Array.isArray(data) ? data : [];
}

/** Estado de la jornada de hoy del empleado autenticado. La usa VistaAsistencia. */
export async function obtenerHoy() {
  const { data } = await api.get('/asistencia/hoy');
  return data;
}

/** Registra la entrada del día. La hora la decide el servidor. */
export async function registrarEntrada() {
  const { data } = await api.post('/asistencia/entrada');
  return data;
}

/** Registra la salida; el motivo solo se envía cuando es anticipada. */
export async function registrarSalida(motivo) {
  const { data } = await api.post('/asistencia/salida', { motivo: motivo ?? null });
  return data;
}
