import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { obtenerConfiguracion } from '../servicios/servicioConfiguracion.js';

export const useAlmacenConfiguracion = defineStore('configuracion', () => {
  const configuracion = ref(null);
  const cargando = ref(false);
  const error = ref('');
  let solicitada = false;

  const nombre = computed(() => configuracion.value?.nombrePeluqueria || 'Peluquería');
  const telefono = computed(() => configuracion.value?.telefono || '');
  const horario = computed(() => configuracion.value?.horarioAtencion || '');
  const moneda = computed(() => configuracion.value?.moneda || '');

  async function cargar({ forzar = false } = {}) {
    if (cargando.value) return;
    if (solicitada && !forzar) return;

    cargando.value = true;
    error.value = '';

    try {
      configuracion.value = await obtenerConfiguracion();
      solicitada = true;
    } catch (excepcion) {
      error.value =
        excepcion?.response?.data?.message || 'No se pudo cargar la configuración de la peluquería.';
    } finally {
      cargando.value = false;
    }
  }

  return {
    configuracion,
    cargando,
    error,
    nombre,
    telefono,
    horario,
    moneda,
    cargar,
  };
});
