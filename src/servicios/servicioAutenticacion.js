import api from './api.js';

/** Inicia sesión y devuelve token, rol, nombre y email. La usa VistaLogin. */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

/** Registra una cuenta de cliente. La usa VistaRegistro. */
export async function registrar(datos) {
  const { data } = await api.post('/auth/registro', datos);
  return data;
}
