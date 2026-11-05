let siguienteId = 4;

export const serviciosMock = [
  { id: 1, nombre: 'Corte de cabello', costo: 15.0, duracionMinutos: 45 },
  { id: 2, nombre: 'Coloración', costo: 35.5, duracionMinutos: 90 },
  { id: 3, nombre: 'Peinado', costo: 12.0, duracionMinutos: 30 },
];

export function agregarServicioMock(datos) {
  const nuevo = { id: siguienteId, ...datos };
  siguienteId += 1;
  serviciosMock.push(nuevo);
  return { ...nuevo };
}
