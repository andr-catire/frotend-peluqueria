function error(codigo, mensaje) {
  return {
    response: {
      data: { error: codigo, message: mensaje },
    },
  };
}

/* ----------------------------- Configuración ----------------------------- */

export const configuracionMock = Object.freeze({
  nombrePeluqueria: 'Peluquería',
  telefono: '',
  horarioAtencion: '',
  moneda: '',
});

/* ------------------------------- Servicios ------------------------------- */

let siguienteIdServicio = 4;

export const serviciosMock = [
  { id: 1, nombre: 'Corte de cabello', precio: 15.0, duracionMinutos: 45, descripcion: null, imagenUrl: null },
  { id: 2, nombre: 'Coloración', precio: 35.5, duracionMinutos: 90, descripcion: null, imagenUrl: null },
  { id: 3, nombre: 'Peinado', precio: 12.0, duracionMinutos: 30, descripcion: null, imagenUrl: null },
];

function normalizarNombreServicio(nombre) {
  return String(nombre ?? '').trim().replace(/\s+/g, ' ');
}

function normalizarDescripcionServicio(descripcion) {
  const texto = String(descripcion ?? '').trim();
  return texto || null;
}

export function agregarServicioMock(datos, imagen = null) {
  const nombre = normalizarNombreServicio(datos?.nombre);
  const repetido = serviciosMock.some(
    (servicio) => normalizarNombreServicio(servicio.nombre).toLocaleLowerCase('es') ===
      nombre.toLocaleLowerCase('es')
  );

  if (repetido) {
    throw error('DUPLICATE', 'Ya existe un servicio con ese nombre.');
  }

  const nuevo = {
    id: siguienteIdServicio,
    nombre,
    precio: Number(datos?.precio),
    duracionMinutos: Number(datos?.duracionMinutos),
    descripcion: normalizarDescripcionServicio(datos?.descripcion),
    imagenUrl: imagen ? URL.createObjectURL(imagen) : null,
  };

  siguienteIdServicio += 1;
  serviciosMock.push(nuevo);
  return { ...nuevo };
}

/* -------------------------------- Personal ------------------------------- */

let siguienteIdEmpleado = 1;
const empleados = [];

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
    id: siguienteIdEmpleado,
    nombre: String(datos?.nombre ?? '').trim(),
    email,
    rol: 'PERSONAL',
    servicios: servicios.map((servicio) => ({ ...servicio })),
    activo: true,
  };

  siguienteIdEmpleado += 1;
  empleados.push(empleado);
  return copiarEmpleado(empleado);
}

/* ------------------------------- Asistencia ------------------------------ */

const CLAVE_HORA = 'peluqueria.asistencia.hora';

let horarioMock = {
  zona: 'America/Caracas',
  apertura: '08:00:00',
  cierre: '18:00:00',
  toleranciaMinutos: 0,
};
let estado = null;
let ultimoTextoHora = null;
let anclaHora = null;
let arranque = 0;

function dosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function horaTexto(fecha) {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;
}

function fechaTexto(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

function aSegundos(texto) {
  if (!texto) return null;
  const [horas, minutos, segundos = '0'] = String(texto).split(':');
  return Number(horas) * 3600 + Number(minutos) * 60 + Number(String(segundos).split('.')[0]);
}

function leerHoraSimulada() {
  const desdeEntorno = import.meta.env.VITE_MOCK_HORA ?? '';
  if (typeof window === 'undefined') return desdeEntorno;
  return window.localStorage.getItem(CLAVE_HORA) || desdeEntorno;
}

function analizarHora(texto) {
  const coincidencia = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(texto ?? '').trim());
  if (!coincidencia) return null;

  const fecha = new Date();
  fecha.setHours(
    Number(coincidencia[1]),
    Number(coincidencia[2]),
    Number(coincidencia[3] ?? 0),
    0
  );
  return fecha;
}

/** Hora simulada que avanza en tiempo real desde el valor configurado. */
function ahora() {
  const texto = leerHoraSimulada();

  if (texto !== ultimoTextoHora) {
    ultimoTextoHora = texto;
    anclaHora = analizarHora(texto);
    arranque = Date.now();
  }

  if (!anclaHora) return new Date();
  return new Date(anclaHora.getTime() + (Date.now() - arranque));
}

function reiniciarSiCambioElDia(fecha) {
  if (!estado || estado.fecha !== fecha) {
    estado = {
      fecha,
      horaEntrada: null,
      minutosTarde: 0,
      horaSalida: null,
      salidaAnticipada: false,
      motivoSalida: null,
    };
  }
}

function normalizarHora(texto) {
  const coincidencia = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(texto ?? '').trim());
  if (!coincidencia) return null;
  return `${dosDigitos(coincidencia[1])}:${coincidencia[2]}:${coincidencia[3] ?? '00'}`;
}

function calcularMinutosTarde(fecha) {
  const apertura = aSegundos(horarioMock.apertura);
  const segundos = fecha.getHours() * 3600 + fecha.getMinutes() * 60 + fecha.getSeconds();
  const limite = apertura + horarioMock.toleranciaMinutos * 60;

  if (segundos <= limite) return 0;
  return Math.floor((segundos - apertura) / 60);
}

function respuesta() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  const segundos = aSegundos(horaTexto(actual));
  const cierre = aSegundos(horarioMock.cierre);
  const conEntrada = Boolean(estado.horaEntrada);
  const conSalida = Boolean(estado.horaSalida);

  return {
    fecha,
    horaActual: horaTexto(actual),
    horaApertura: horarioMock.apertura,
    horaCierre: horarioMock.cierre,
    horaEntrada: estado.horaEntrada,
    horaSalida: estado.horaSalida,
    llegoTarde: estado.minutosTarde > 0,
    minutosTarde: estado.minutosTarde,
    salidaAnticipada: estado.salidaAnticipada,
    puedeRegistrarEntrada: !conEntrada && segundos <= cierre,
    puedeRegistrarSalida: conEntrada && !conSalida && segundos >= cierre,
    salidaHabilitadaDesde: `${fecha}T${horarioMock.cierre}`,
  };
}

export async function obtenerHoyMock() {
  return respuesta();
}

export async function obtenerHorarioMock() {
  return { ...horarioMock };
}

export async function actualizarHorarioMock(datos) {
  const apertura = normalizarHora(datos?.apertura);
  const cierre = normalizarHora(datos?.cierre);

  if (!apertura || !cierre) {
    throw error('VALIDATION_ERROR', 'Indica la hora de apertura y la de cierre.');
  }

  if (aSegundos(apertura) >= aSegundos(cierre)) {
    throw error(
      'HORARIO_INVALIDO',
      'La hora de apertura debe ser anterior a la hora de cierre.'
    );
  }

  horarioMock = { ...horarioMock, apertura, cierre };
  return { ...horarioMock };
}

export async function listarAsistenciasMock(fecha) {
  const dia = fecha || fechaTexto(ahora());
  const hoy = fechaTexto(new Date());
  const base = [
    { personalId: 5, nombre: 'Marta Ríos', email: 'marta@correo.com' },
    { personalId: 6, nombre: 'Luis Pérez', email: 'luis@correo.com' },
    { personalId: 7, nombre: 'Valeria Morales', email: 'valeria@correo.com' },
  ];

  if (dia !== hoy) {
    return base.map((persona) => ({
      ...persona,
      horaEntrada: null,
      horaSalida: null,
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: false,
    }));
  }

  return [
    {
      ...base[0],
      horaEntrada: '08:00:00',
      horaSalida: '18:00:00',
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: true,
    },
    {
      ...base[1],
      horaEntrada: '08:18:00',
      horaSalida: '17:10:00',
      llegoTarde: true,
      minutosTarde: 18,
      salidaAnticipada: true,
      motivoSalida: 'Cita médica programada',
      trabajo: true,
    },
    {
      ...base[2],
      horaEntrada: null,
      horaSalida: null,
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: false,
    },
  ];
}

export async function registrarEntradaMock() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  if (estado.horaEntrada) {
    throw error('ENTRADA_YA_REGISTRADA', 'Ya registraste tu entrada de hoy.');
  }

  if (aSegundos(horaTexto(actual)) > aSegundos(horarioMock.cierre)) {
    throw error(
      'ENTRADA_FUERA_DE_HORARIO',
      'Ya pasó la hora de cierre del local. No se puede registrar la entrada.'
    );
  }

  estado.horaEntrada = horaTexto(actual);
  estado.minutosTarde = calcularMinutosTarde(actual);
  return respuesta();
}

export async function registrarSalidaMock(motivo) {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  if (!estado.horaEntrada) {
    throw error('SIN_ENTRADA', 'Primero debes registrar tu entrada.');
  }

  if (estado.horaSalida) {
    throw error('SALIDA_YA_REGISTRADA', 'Ya registraste tu salida de hoy.');
  }

  const anticipada = aSegundos(horaTexto(actual)) < aSegundos(horarioMock.cierre);
  const motivoLimpio = String(motivo ?? '').trim();

  if (anticipada && motivoLimpio.length < 5) {
    throw error(
      'MOTIVO_REQUERIDO',
      'Para salir antes del cierre debes indicar un motivo de al menos 5 caracteres.'
    );
  }

  estado.horaSalida = horaTexto(actual);
  estado.salidaAnticipada = anticipada;
  estado.motivoSalida = anticipada ? motivoLimpio : null;
  return respuesta();
}
