import api from './api.js';

/** Lista los estilistas activos. La usa VistaPersonalAdministracion. */
export async function listar() {
  const { data } = await api.get('/personal');
  return data;
}

/** Registra una cuenta de estilista. La usa ModalEstilista. */
export async function registrar(datos) {
  const { data } = await api.post('/personal', datos);
  return data;
}
