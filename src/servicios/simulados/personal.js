import { serviciosMock } from './servicios.js';

const cuentas = [
  { id: 8, nombre: 'Luis Pérez', email: 'luis@correo.com', rol: 'CLIENTE' },
  { id: 9, nombre: 'Marta Ríos', email: 'marta@correo.com', rol: 'PERSONAL' },
];

function error(codigo, mensaje) {
  return {
    response: {
      data: { error: codigo, message: mensaje },
    },
  };
}

export async function buscarEmpleadoMock(email) {
  const correo = String(email ?? '').trim().toLowerCase();
  const cuenta = cuentas.find((actual) => actual.email === correo);

  if (!cuenta) {
    throw error('NOT_FOUND', 'No existe una cuenta con ese correo.');
  }

  if (cuenta.rol !== 'CLIENTE') {
    throw error('NOT_PROMOTABLE', 'La cuenta ya tiene un rol que no se puede promover a estilista.');
  }

  return { ...cuenta };
}

export async function promoverEmpleadoMock(datos) {
  const cuenta = cuentas.find((actual) => actual.id === datos?.idUsuario);

  if (!cuenta) {
    throw error('NOT_FOUND', 'No existe la cuenta que quieres promover.');
  }

  cuenta.rol = 'PERSONAL';

  return {
    ...cuenta,
    servicios: serviciosMock.filter((servicio) =>
      (datos?.serviciosIds ?? []).includes(servicio.id)
    ),
  };
}
