import api from './api.js';

/** Datos del perfil del cliente autenticado. La usa VistaPerfil. */
export async function obtenerPerfil() {
  const { data } = await api.get('/perfil');
  return data;
}

/** Modifica nombre, cédula y teléfono. Devuelve el perfil ya guardado. La usa VistaPerfil. */
export async function actualizarPerfil(datos) {
  const { data } = await api.put('/perfil', datos);
  return data;
}

/** Cambia la contraseña. Exige la actual. La usa VistaPerfil. */
export async function cambiarPassword(datos) {
  await api.put('/perfil/password', datos);
}
