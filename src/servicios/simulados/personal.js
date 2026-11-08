import { serviciosMock } from './servicios.js';

let siguienteId = 1;
const empleados = [];

function error(codigo, mensaje) {
  return {
    response: {
      data: { error: codigo, message: mensaje },
    },
  };
}

function normalizarEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function copiarEmpleado(empleado) {
  return {
    ...empleado,
    servicios: empleado.servicios.map((servicio) => ({ ...servicio })),
  };
}

export async function listarEmpleadosMock() {
  return empleados.filter((empleado) => empleado.activo).map(copiarEmpleado);
}

export async function registrarEmpleadoMock(datos) {
  const email = normalizarEmail(datos?.email);

  if (empleados.some((empleado) => empleado.email === email)) {
    throw error('EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.');
  }

  const ids = datos?.serviciosIds ?? [];
  const servicios = serviciosMock.filter((servicio) => ids.includes(servicio.id));

  if (servicios.length !== ids.length) {
    throw error('NOT_FOUND', 'No existen todos los servicios seleccionados.');
  }

  const empleado = {
    id: siguienteId,
    nombre: String(datos?.nombre ?? '').trim(),
    email,
    rol: 'PERSONAL',
    servicios: servicios.map((servicio) => ({ ...servicio })),
    activo: true,
  };

  siguienteId += 1;
  empleados.push(empleado);
  return copiarEmpleado(empleado);
}
