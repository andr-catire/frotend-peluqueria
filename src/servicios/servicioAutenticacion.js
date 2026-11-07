import api from './api.js';

/**
 * Llama al endpoint POST /auth/login y devuelve los datos de sesión.
 * Si el servidor backend no está encendido o no responde, provee un fallback
 * de desarrollo para las credenciales predeterminadas del administrador.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, rol: string, nombre: string, email: string}>}
 */
export async function login(email, password) {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    const esErrorConexion = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');

    if (esErrorConexion) {
      const correoLimpio = String(email || '').trim().toLowerCase();

      if (correoLimpio === 'admin@peluqueria.com' && password === 'Admin1234*') {
        return {
          token: 'token_jwt_desarrollo_admin_peluqueria',
          rol: 'ADMIN',
          nombre: 'Administrador',
          email: 'admin@peluqueria.com'
        };
      }

      throw new Error('No se pudo conectar con el servidor (puerto 3000). Para probar sin backend usa: admin@peluqueria.com / Admin1234*');
    }

    throw error;
  }
}
