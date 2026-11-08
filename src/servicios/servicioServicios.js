import api from './api.js';

function normalizarServicio(servicio) {
  if (!servicio?.imagenUrl || /^(https?:|blob:|data:)/.test(servicio.imagenUrl)) {
    return servicio;
  }

  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return { ...servicio, imagenUrl: `${base}${servicio.imagenUrl}` };
}

/** Lista los servicios activos. La usan el catálogo y la agenda. */
export async function listar() {
  const { data } = await api.get('/servicios');
  return Array.isArray(data) ? data.map(normalizarServicio) : [];
}

/** Crea un servicio y, si hay imagen, la envía como WebP. La usa ModalServicio. */
export async function crear(datos, imagen = null) {
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
