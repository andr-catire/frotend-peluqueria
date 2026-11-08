import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const CLAVE_SESION = 'peluqueria.auth';

function leerSesionGuardada() {
  if (typeof window === 'undefined') return null;

  try {
    const crudo = window.localStorage.getItem(CLAVE_SESION);
    if (!crudo) return null;

    const datos = JSON.parse(crudo);
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    return null;
  }
}

export const useAlmacenAutenticacion = defineStore('autenticacion', () => {
  const guardada = leerSesionGuardada();

  const token = ref(guardada?.token ?? '');
  const rol = ref(guardada?.rol ?? '');
  const nombre = ref(guardada?.nombre ?? '');
  const email = ref(guardada?.email ?? '');

  const estaAutenticado = computed(() => Boolean(token.value));

  const rolLabel = computed(
    () =>
      ({
        CLIENTE: 'Cliente',
        PERSONAL: 'Estilista',
        ADMIN: 'Administrador',
      })[rol.value] ?? ''
  );

  const iniciales = computed(() =>
    nombre.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase()
  );

  const rutaInicio = computed(() => {
    if (rol.value === 'PERSONAL') {
      return { name: 'no-autorizado', query: { motivo: 'personal' } };
    }
    return { name: 'servicios' };
  });

  function guardarSesion() {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({
        token: token.value,
        rol: rol.value,
        nombre: nombre.value,
        email: email.value,
      })
    );
  }

  function login(datos) {
    token.value = datos?.token ?? '';
    rol.value = datos?.rol ?? '';
    nombre.value = datos?.nombre ?? '';
    email.value = datos?.email ?? '';
    guardarSesion();
  }

  function logout() {
    token.value = '';
    rol.value = '';
    nombre.value = '';
    email.value = '';

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CLAVE_SESION);
    }
  }

  return {
    token,
    rol,
    nombre,
    email,
    estaAutenticado,
    rolLabel,
    iniciales,
    rutaInicio,
    login,
    logout,
  };
});
