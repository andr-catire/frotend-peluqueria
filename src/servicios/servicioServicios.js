import api from './api.js';
import { agregarServicioMock, serviciosMock } from './simulados/servicios.js';

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function normalizarServicio(servicio) {
  if (!servicio?.imagenUrl || /^(https?:|blob:|data:)/.test(servicio.imagenUrl)) {
    return servicio;
  }

  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return { ...servicio, imagenUrl: `${base}${servicio.imagenUrl}` };
}

/** Lista los servicios activos. La usa VistaServiciosAdministracion. */
export async function listar() {
  if (USAR_MOCKS) {
    return serviciosMock
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((servicio) => ({ ...servicio }));
  }

  const { data } = await api.get('/servicios');
  return Array.isArray(data) ? data.map(normalizarServicio) : [];
}

/** Crea un servicio y, si hay imagen, la envía como WebP. La usa ModalServicio. */
export async function crear(datos, imagen = null) {
  if (USAR_MOCKS) return agregarServicioMock(datos, imagen);

  if (imagen) {
    const formulario = new FormData();
    formulario.append('servicio', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    formulario.append('imagen', imagen, 'servicio.webp');

    const { data } = await api.post('/servicios', formulario);
    return normalizarServicio(data);
  }

  const { data } = await api.post('/servicios', datos);
  return normalizarServicio(data);
}
