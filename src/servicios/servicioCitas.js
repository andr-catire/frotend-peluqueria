import api from './api.js';

/** Obtiene los estilistas que ofrecen un servicio específico. */
export async function obtenerEstilistasPorServicio(servicioId) {
  const { data } = await api.get(`/servicios/${servicioId}/estilistas`);
  return Array.isArray(data) ? data : [];
}

/** Obtiene los horarios disponibles para un estilista y fecha dados. */
export async function obtenerDisponibilidad(servicioId, estilistaId, fecha) {
  const { data } = await api.get('/citas/disponibilidad', {
    params: { servicioId, estilistaId, fecha },
  });
  return Array.isArray(data) ? data : [];
}

/** Agenda una cita para el usuario autenticado. */
export async function agendarCita(datos) {
  const { data } = await api.post('/citas', datos);
  return data;
}

/** Obtiene el historial de citas del usuario autenticado. */
export async function obtenerMisCitas() {
  const { data } = await api.get('/citas/mis-citas');
  return Array.isArray(data) ? data : [];
}

/** Obtiene la agenda semanal para administradores o estilistas. */
export async function obtenerAgendaSemanal(fechaInicio, fechaFin, estilistaId = null) {
  const params = { fechaInicio, fechaFin };
  if (estilistaId) params.estilistaId = estilistaId;
  const { data } = await api.get('/citas/agenda-semanal', { params });
  return Array.isArray(data) ? data : [];
}
