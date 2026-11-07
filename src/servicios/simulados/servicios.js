let siguienteId = 4;

export const serviciosMock = [
  { id: 1, nombre: 'Corte de cabello', costo: 15.0, duracionMinutos: 45, descripcion: null, imagenUrl: null },
  { id: 2, nombre: 'Coloración', costo: 35.5, duracionMinutos: 90, descripcion: null, imagenUrl: null },
  { id: 3, nombre: 'Peinado', costo: 12.0, duracionMinutos: 30, descripcion: null, imagenUrl: null },
];

function normalizarNombre(nombre) {
  return String(nombre ?? '').trim().replace(/\s+/g, ' ');
}

function normalizarDescripcion(descripcion) {
  const texto = String(descripcion ?? '').trim();
  return texto || null;
}

export function agregarServicioMock(datos, imagen = null) {
  const nombre = normalizarNombre(datos?.nombre);
  const repetido = serviciosMock.some(
    (servicio) => normalizarNombre(servicio.nombre).toLocaleLowerCase('es') ===
      nombre.toLocaleLowerCase('es')
  );

  if (repetido) {
    throw {
      response: {
        data: {
          error: 'DUPLICATE',
          message: 'Ya existe un servicio con ese nombre.',
        },
      },
    };
  }

  const nuevo = {
    id: siguienteId,
    nombre,
    costo: Number(datos?.costo),
    duracionMinutos: Number(datos?.duracionMinutos),
    descripcion: normalizarDescripcion(datos?.descripcion),
    imagenUrl: imagen ? URL.createObjectURL(imagen) : null,
  };

  siguienteId += 1;
  serviciosMock.push(nuevo);
  return { ...nuevo };
}
